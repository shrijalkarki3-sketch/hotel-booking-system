import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Review from '../models/Review.js';

/**
 * @desc    Get all hotels with advanced search, filtering, and pagination
 * @route   GET /api/v1/hotels
 * @access  Public
 */
export const getHotels = async (req, res, next) => {
  try {
    const {
      search,
      city,
      priceMin,
      priceMax,
      rating,
      amenities,
      roomType,
      guests,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const query = { status: 'active' };

    // 1. Keyword & Location Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } },
      ];
    } else if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    // 2. Minimum Rating Filter
    if (rating && !isNaN(Number(rating))) {
      query['rating.average'] = { $gte: Number(rating) };
    }

    // 3. Amenities Filter (Comma-separated or array)
    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim()).filter(Boolean);
      
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    // 4. Room-level Filtering (Price range, Room type, Guest capacity)
    if (priceMin || priceMax || roomType || guests) {
      const roomQuery = { status: 'available' };

      if (priceMin || priceMax) {
        roomQuery.pricePerNight = {};
        if (priceMin) roomQuery.pricePerNight.$gte = Number(priceMin);
        if (priceMax) roomQuery.pricePerNight.$lte = Number(priceMax);
      }

      if (roomType) {
        roomQuery.roomType = roomType;
      }

      if (guests) {
        roomQuery['capacity.adults'] = { $gte: Number(guests) };
      }

      // Find all unique hotel IDs that match room conditions
      const matchingHotelIds = await Room.distinct('hotelId', roomQuery);
      query._id = { $in: matchingHotelIds };
    }

    // 5. Pagination setup
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const startIndex = (pageNum - 1) * limitNum;

    // 6. Sorting Setup
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc' || sort === 'price_desc') {
      // Sorting by price will be handled after startingPrice calculation
    } else if (sort === 'rating') {
      sortOptions = { 'rating.average': -1, 'rating.count': -1 };
    } else if (sort === 'name') {
      sortOptions = { name: 1 };
    }

    const total = await Hotel.countDocuments(query);
    const hotels = await Hotel.find(query)
      .populate('managerId', 'name email phone')
      .sort(sortOptions)
      .skip(startIndex)
      .limit(limitNum)
      .lean();

    // 7. Calculate lowest starting price per night for each hotel dynamically
    const hotelIds = hotels.map((h) => h._id);
    const rooms = await Room.find({ hotelId: { $in: hotelIds }, status: 'available' })
      .select('hotelId pricePerNight')
      .lean();

    const priceMap = {};
    rooms.forEach((r) => {
      const hId = (r.hotelId._id || r.hotelId).toString();
      if (!priceMap[hId] || r.pricePerNight < priceMap[hId]) {
        priceMap[hId] = r.pricePerNight;
      }
    });

    const hotelsWithPricing = hotels.map((hotel) => {
      const minPrice = priceMap[hotel._id.toString()] || 0;
      return {
        ...hotel,
        startingPrice: minPrice,
      };
    });

    // Handle price sorting if requested
    if (sort === 'price_asc') {
      hotelsWithPricing.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sort === 'price_desc') {
      hotelsWithPricing.sort((a, b) => b.startingPrice - a.startingPrice);
    }

    res.status(200).json({
      success: true,
      count: hotelsWithPricing.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      data: hotelsWithPricing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single hotel by ID with rooms catalog and reviews summary
 * @route   GET /api/v1/hotels/:id
 * @access  Public
 */
export const getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('managerId', 'name email phone')
      .lean();

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    // Fetch available & catalog rooms for this hotel (supporting both ObjectId & string stored hotelId)
    let hotelObjId;
    try {
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        hotelObjId = new mongoose.Types.ObjectId(req.params.id);
      }
    } catch (e) {}

    const roomQuery = hotelObjId
      ? { hotelId: { $in: [req.params.id, hotelObjId] } }
      : { hotelId: req.params.id };

    const rooms = await Room.find(roomQuery).sort({ pricePerNight: 1 }).lean();

    // Fetch published reviews
    const reviews = await Review.find({ hotelId: req.params.id, status: 'published' })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Calculate starting price
    const minPrice = rooms.length > 0
      ? Math.min(...rooms.map((r) => r.pricePerNight))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        ...hotel,
        startingPrice: minPrice,
        rooms,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get popular destinations with hotel counts
 * @route   GET /api/v1/hotels/destinations/popular
 * @access  Public
 */
export const getPopularDestinations = async (req, res, next) => {
  try {
    const destinations = await Hotel.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$location.city',
          count: { $sum: 1 },
          sampleImage: { $first: { $arrayElemAt: ['$images', 0] } },
          country: { $first: '$location.country' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    res.status(200).json({
      success: true,
      data: destinations.map((d) => ({
        city: d._id,
        count: d.count,
        image: d.sampleImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        country: d.country,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get hotels managed by logged-in manager
 * @route   GET /api/v1/hotels/manager/my-hotels
 * @access  Private (Hotel Manager / Admin)
 */
export const getManagerHotels = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { managerId: req.user._id };
    const hotels = await Hotel.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new hotel listing
 * @route   POST /api/v1/hotels
 * @access  Private (Hotel Manager / Admin)
 */
export const createHotel = async (req, res, next) => {
  try {
    const { name, description, location, images, amenities, contact } = req.body;

    if (!name || !description || !location?.city || !location?.address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide hotel name, description, city, and address',
      });
    }

    const hotel = await Hotel.create({
      name,
      description,
      location,
      images: images || [],
      amenities: amenities || [],
      contact: contact || { phone: '', email: req.user.email },
      managerId: req.user._id,
      status: 'active',
    });

    // Auto-create starter rooms so newly added hotels immediately have bookable rooms
    const starterRooms = [
      {
        hotelId: hotel._id,
        roomNumber: '101',
        roomType: 'Deluxe',
        description: 'Spacious deluxe room featuring a king-size bed, private balcony, mini-bar, and modern ensuite bath.',
        pricePerNight: 120,
        capacity: { adults: 2, children: 1 },
        amenities: ['Free WiFi', 'Air Conditioning', 'Private Balcony', 'Mini Bar'],
        images: images && images.length > 0 ? [images[0]] : [],
        status: 'available',
      },
      {
        hotelId: hotel._id,
        roomNumber: '202',
        roomType: 'Suite',
        description: 'Luxury executive suite with separate master bedroom, living lounge, and complimentary premium breakfast.',
        pricePerNight: 210,
        capacity: { adults: 2, children: 2 },
        amenities: ['Free WiFi', 'Living Room', 'Jacuzzi', 'Espresso Machine'],
        images: images && images.length > 1 ? [images[1]] : [],
        status: 'available',
      },
    ];

    await Room.insertMany(starterRooms);

    res.status(201).json({
      success: true,
      message: 'Hotel listing created successfully with starter rooms',
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing hotel listing
 * @route   PUT /api/v1/hotels/:id
 * @access  Private (Owner Manager / Admin)
 */
export const updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Ownership Guard: Only owner manager or admin can modify
    const isOwner = hotel.managerId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You cannot edit another manager’s hotel',
      });
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      data: updatedHotel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a hotel listing (and associated rooms/reviews)
 * @route   DELETE /api/v1/hotels/:id
 * @access  Private (Owner Manager / Admin)
 */
export const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const isOwner = hotel.managerId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You cannot delete another manager’s hotel',
      });
    }

    // Cascade delete rooms & reviews
    await Room.deleteMany({ hotelId: req.params.id });
    await Review.deleteMany({ hotelId: req.params.id });
    await hotel.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Hotel listing and associated room specifications deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
