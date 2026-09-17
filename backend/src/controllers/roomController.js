import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

/**
 * @desc    Add a room to a hotel
 * @route   POST /api/v1/hotels/:hotelId/rooms
 * @access  Private (Hotel Manager / Admin)
 */
export const createRoom = async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const { roomNumber, roomType, description, pricePerNight, capacity, amenities, images } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Ownership check
    const isOwner = hotel.managerId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You cannot add rooms to another manager’s hotel',
      });
    }

    if (!roomNumber || !roomType || !pricePerNight) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomNumber, roomType, and pricePerNight',
      });
    }

    const room = await Room.create({
      hotelId,
      roomNumber,
      roomType,
      description: description || '',
      pricePerNight: Number(pricePerNight),
      capacity: capacity || { adults: 2, children: 0 },
      amenities: amenities || [],
      images: images || [],
      status: 'available',
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update room details
 * @route   PUT /api/v1/rooms/:id
 * @access  Private (Hotel Manager / Admin)
 */
export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotelId');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const isOwner = room.hotelId?.managerId?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You cannot edit another manager’s room',
      });
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Room details updated successfully',
      data: updatedRoom,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a room
 * @route   DELETE /api/v1/rooms/:id
 * @access  Private (Hotel Manager / Admin)
 */
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotelId');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const isOwner = room.hotelId?.managerId?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You cannot delete another manager’s room',
      });
    }

    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
