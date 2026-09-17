import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import mongoose from 'mongoose';

/**
 * @desc    Get Customer Dashboard Statistics
 * @route   GET /api/v1/analytics/customer
 * @access  Private (Customer)
 */
export const getCustomerAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate booking counts & total spent for this customer
    const stats = await Booking.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedCount: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'confirmed'] }, 1, 0] },
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'completed'] }, 1, 0] },
          },
          cancelledCount: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'cancelled'] }, 1, 0] },
          },
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0],
            },
          },
        },
      },
    ]);

    const data = stats[0] || {
      totalBookings: 0,
      confirmedCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      totalSpent: 0,
    };

    // Get 5 most recent bookings
    const recentBookings = await Booking.find({ userId })
      .populate('hotelId', 'name location images')
      .populate('roomId', 'roomNumber roomType pricePerNight')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: data,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Hotel Manager Dashboard Statistics (Scoped strictly to manager's hotels)
 * @route   GET /api/v1/analytics/manager
 * @access  Private (Hotel Manager / Admin)
 */
export const getManagerAnalytics = async (req, res, next) => {
  try {
    const managerId = req.user._id;

    // 1. Fetch manager's hotels
    const managerHotels = await Hotel.find({ managerId }).select('_id name');
    const hotelIds = managerHotels.map((h) => h._id);

    // 2. Fetch manager's rooms count & status
    const totalRooms = await Room.countDocuments({ hotelId: { $in: hotelIds } });
    const availableRooms = await Room.countDocuments({ hotelId: { $in: hotelIds }, status: 'available' });

    // 3. Aggregate booking stats & revenue for manager's hotels
    const bookingStats = await Booking.aggregate([
      { $match: { hotelId: { $in: hotelIds } } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          pendingCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'pending'] }, 1, 0] } },
          confirmedCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'confirmed'] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'completed'] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'cancelled'] }, 1, 0] } },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] },
          },
        },
      },
    ]);

    const bookingData = bookingStats[0] || {
      totalBookings: 0,
      pendingCount: 0,
      confirmedCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      totalRevenue: 0,
    };

    // 4. Fetch 5 most recent bookings for manager's hotels
    const recentBookings = await Booking.find({ hotelId: { $in: hotelIds } })
      .populate('hotelId', 'name')
      .populate('roomId', 'roomNumber roomType')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalHotels: managerHotels.length,
        totalRooms,
        availableRooms,
        occupiedRooms: totalRooms - availableRooms,
        stats: bookingData,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get System Admin Dashboard Master Statistics & Analytics
 * @route   GET /api/v1/analytics/admin
 * @access  Private (Admin Only)
 */
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const customerCount = await User.countDocuments({ role: 'customer' });
    const managerCount = await User.countDocuments({ role: 'hotel_manager' });

    const totalHotels = await Hotel.countDocuments();
    const totalRooms = await Room.countDocuments();

    // Aggregate global revenue & booking counts
    const globalBookingStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'confirmed'] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'completed'] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'cancelled'] }, 1, 0] } },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] },
          },
        },
      },
    ]);

    const bookingData = globalBookingStats[0] || {
      totalBookings: 0,
      confirmedCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      totalRevenue: 0,
    };

    const pendingPaymentsCount = await Payment.countDocuments({ paymentStatus: 'initiated' });

    // Recent registered users & bookings
    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);
    const recentBookings = await Booking.find()
      .populate('hotelId', 'name')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, customers: customerCount, managers: managerCount },
        inventory: { totalHotels, totalRooms },
        bookings: bookingData,
        payments: { pending: pendingPaymentsCount },
        recentUsers,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
