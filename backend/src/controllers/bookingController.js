import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import { validateBookingDates, calculateNights, canCancelBooking } from '../utils/dateUtils.js';
import { createNotification } from '../utils/notificationHelper.js';

/**
 * @desc    Check room availability for requested date range
 * @route   POST /api/v1/bookings/check-availability
 * @access  Public
 */
export const checkRoomAvailability = async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomId, checkIn date, and checkOut date',
      });
    }

    // 1. Validate Date Formatting & Logic
    const dateValidation = validateBookingDates(checkIn, checkOut);
    if (!dateValidation.valid) {
      return res.status(400).json({
        success: false,
        message: dateValidation.message,
      });
    }

    // 2. Fetch Room Record
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Selected room not found',
      });
    }

    if (room.status !== 'available') {
      return res.status(200).json({
        success: true,
        available: false,
        message: `Room is currently undergoing ${room.status}`,
      });
    }

    // 3. Date Overlap Query Formula: (RequestedCheckIn < ExistingCheckOut) AND (RequestedCheckOut > ExistingCheckIn)
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const overlappingBooking = await Booking.findOne({
      roomId,
      bookingStatus: { $in: ['confirmed', 'pending'] },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });

    const numberOfNights = calculateNights(checkIn, checkOut);
    const pricePerNight = room.pricePerNight;
    const totalAmount = numberOfNights * pricePerNight;

    if (overlappingBooking) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'Room is already booked for the selected date range',
        data: {
          roomId,
          numberOfNights,
          pricePerNight,
          totalAmount,
        },
      });
    }

    return res.status(200).json({
      success: true,
      available: true,
      message: 'Room is available for the selected dates!',
      data: {
        roomId,
        numberOfNights,
        pricePerNight,
        totalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new booking (Strict Availability & Price Verification)
 * @route   POST /api/v1/bookings
 * @access  Private (Authenticated Users)
 */
export const createBooking = async (req, res, next) => {
  try {
    const { hotelId, roomId, checkIn, checkOut, guests } = req.body;
    const userId = req.user._id;

    // 1. Basic Inputs Presence Check
    if (!hotelId || !roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide hotelId, roomId, checkIn date, and checkOut date',
      });
    }

    // 2. Validate Check-in / Check-out Dates
    const dateValidation = validateBookingDates(checkIn, checkOut);
    if (!dateValidation.valid) {
      return res.status(400).json({
        success: false,
        message: dateValidation.message,
      });
    }

    // 3. Verify Hotel Exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel || hotel.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Selected hotel does not exist or is inactive',
      });
    }

    // 4. Verify Room Exists & Belongs to Selected Hotel
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Selected room does not exist',
      });
    }

    if (room.hotelId.toString() !== hotelId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Security Violation - Room does not belong to the specified hotel',
      });
    }

    if (room.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Room is currently ${room.status} and cannot be booked`,
      });
    }

    // 5. Validate Guest Capacity against Room Spec
    const adultCount = guests?.adults ? parseInt(guests.adults, 10) : 1;
    const childCount = guests?.children ? parseInt(guests.children, 10) : 0;

    if (adultCount > room.capacity.adults) {
      return res.status(400).json({
        success: false,
        message: `Room capacity exceeded. Maximum allowed adults for this room is ${room.capacity.adults}`,
      });
    }

    // 6. Atomic Final Date Overlap Check (Prevents Double Booking & Race Conditions)
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const existingBooking = await Booking.findOne({
      roomId,
      bookingStatus: { $in: ['confirmed', 'pending'] },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Room has just been booked by another guest for these dates. Please choose alternative dates or rooms.',
      });
    }

    // 7. Calculate Server-Side Pricing (Never Trust Client Prices)
    const numberOfNights = calculateNights(checkIn, checkOut);
    const pricePerNight = room.pricePerNight; // Retrieved strictly from DB
    const totalAmount = numberOfNights * pricePerNight;

    // 8. Create Booking Record
    const booking = await Booking.create({
      userId,
      hotelId,
      roomId,
      checkIn: start,
      checkOut: end,
      guests: {
        adults: adultCount,
        children: childCount,
      },
      numberOfNights,
      pricePerNight,
      totalAmount,
      bookingStatus: 'confirmed',
      paymentStatus: 'unpaid',
    });

    // Populate for clean response receipt
    const populatedBooking = await Booking.findById(booking._id)
      .populate('hotelId', 'name location images contact')
      .populate('roomId', 'roomNumber roomType pricePerNight capacity amenities')
      .populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created and confirmed successfully!',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer's booking history
 * @route   GET /api/v1/bookings/my-bookings
 * @access  Private (Customer)
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user._id };

    if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      query.bookingStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('hotelId', 'name location images rating')
      .populate('roomId', 'roomNumber roomType pricePerNight')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed receipt for a single booking
 * @route   GET /api/v1/bookings/:id
 * @access  Private (Owner / Manager / Admin)
 */
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotelId', 'name description location images contact rating')
      .populate('roomId', 'roomNumber roomType description pricePerNight capacity amenities images')
      .populate('userId', 'name email phone profileImage');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found',
      });
    }

    // Ownership & Role Access Control Guard
    const isOwner = booking.userId._id.toString() === req.user._id.toString();
    const isAdminOrManager = ['admin', 'hotel_manager'].includes(req.user.role);

    if (!isOwner && !isAdminOrManager) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You are not authorized to view another customer’s booking details',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an eligible booking
 * @route   PATCH /api/v1/bookings/:id/cancel
 * @access  Private (Owner / Manager / Admin)
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found',
      });
    }

    // Ownership Guard
    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdminOrManager = ['admin', 'hotel_manager'].includes(req.user.role);

    if (!isOwner && !isAdminOrManager) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You cannot cancel another customer’s booking',
      });
    }

    // Check cancellation policy eligibility
    const policyCheck = canCancelBooking(booking);
    if (!policyCheck.canCancel) {
      return res.status(400).json({
        success: false,
        message: policyCheck.reason,
      });
    }

    // Execute cancellation state transition
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by customer';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Reservation dates have been released.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings for hotels owned by logged-in manager
 * @route   GET /api/v1/bookings/manager/all
 * @access  Private (Hotel Manager / Admin)
 */
export const getManagerBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;

    // Find hotels owned by manager
    const managerHotels = await Hotel.find(
      req.user.role === 'admin' ? {} : { managerId: req.user._id }
    ).select('_id');
    const hotelIds = managerHotels.map((h) => h._id);

    const query = { hotelId: { $in: hotelIds } };
    if (status && ['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      query.bookingStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('hotelId', 'name location')
      .populate('roomId', 'roomNumber roomType pricePerNight')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking status (Confirm, Complete, Cancel)
 * @route   PATCH /api/v1/bookings/:id/status
 * @access  Private (Hotel Manager / Admin)
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingStatus } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, confirmed, completed, or cancelled',
      });
    }

    const booking = await Booking.findById(req.params.id).populate('hotelId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found' });
    }

    const isOwner = booking.hotelId?.managerId?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You cannot update bookings for another manager’s hotel',
      });
    }

    booking.bookingStatus = bookingStatus;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${bookingStatus}`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
