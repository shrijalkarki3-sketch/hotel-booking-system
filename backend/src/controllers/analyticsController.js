import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import mongoose from 'mongoose';

const getBookingDateFilter = (startDate, endDate) => {
  const dateFilter = {};

  if (startDate) {
    dateFilter.$gte = new Date(startDate);
  }

  if (endDate) {
    dateFilter.$lte = new Date(endDate);
  }

  return Object.keys(dateFilter).length ? { checkIn: dateFilter } : {};
};

const normalizeStatusBreakdown = (statusRows = []) => {
  const statusMap = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  statusRows.forEach((row) => {
    if (row._id && statusMap[row._id] !== undefined) {
      statusMap[row._id] = row.count;
    }
  });

  return statusMap;
};

const getRevenueSummary = async (match) => {
  const revenueRows = await Booking.aggregate([
    { $match: { ...match, paymentStatus: 'paid' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        paidBookings: { $sum: 1 },
        avgBookingValue: { $avg: '$totalAmount' },
      },
    },
  ]);

  const confirmedRevenueRows = await Booking.aggregate([
    {
      $match: {
        ...match,
        paymentStatus: 'paid',
        bookingStatus: { $in: ['confirmed', 'completed'] },
      },
    },
    { $group: { _id: null, confirmedRevenue: { $sum: '$totalAmount' } } },
  ]);

  const completedRevenueRows = await Booking.aggregate([
    {
      $match: {
        ...match,
        paymentStatus: 'paid',
        bookingStatus: 'completed',
      },
    },
    { $group: { _id: null, completedRevenue: { $sum: '$totalAmount' } } },
  ]);

  const totalRevenue = revenueRows[0]?.totalRevenue || 0;
  const paidBookings = revenueRows[0]?.paidBookings || 0;

  return {
    totalRevenue,
    confirmedRevenue: confirmedRevenueRows[0]?.confirmedRevenue || 0,
    completedRevenue: completedRevenueRows[0]?.completedRevenue || 0,
    paidBookings,
    avgBookingValue: revenueRows[0]?.avgBookingValue || 0,
    revenueDefinition: 'Revenue counts bookings with paymentStatus = "paid" only. Cancelled, unpaid, and refunded bookings are excluded.',
  };
};

const getManagerHotelScope = async (req) => {
  if (req.user.role === 'admin') {
    const allHotels = await Hotel.find().select('_id name');
    return {
      hotelIds: allHotels.map((hotel) => hotel._id),
      hotels: allHotels,
      isAdminScope: true,
    };
  }

  const managerHotels = await Hotel.find({ managerId: req.user._id }).select('_id name');
  return {
    hotelIds: managerHotels.map((hotel) => hotel._id),
    hotels: managerHotels,
    isAdminScope: false,
  };
};

/**
 * @desc    Get Customer Dashboard Statistics
 * @route   GET /api/v1/analytics/customer
 * @access  Private (Customer)
 */
export const getCustomerAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stats = await Booking.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'confirmed'] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'completed'] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'cancelled'] }, 1, 0] } },
          totalSpent: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } },
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
    const targetHotels = req.user.role === 'admin' ? await Hotel.find().select('_id name') : await Hotel.find({ managerId }).select('_id name');
    const hotelIds = targetHotels.map((h) => h._id);

    const totalRooms = await Room.countDocuments({ hotelId: { $in: hotelIds } });
    const availableRooms = await Room.countDocuments({ hotelId: { $in: hotelIds }, status: 'available' });

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
          totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } },
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

    const recentBookings = await Booking.find({ hotelId: { $in: hotelIds } })
      .populate('hotelId', 'name')
      .populate('roomId', 'roomNumber roomType')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalHotels: targetHotels.length,
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

    const globalBookingStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'confirmed'] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'completed'] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'cancelled'] }, 1, 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } },
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

export const getManagerReports = async (req, res, next) => {
  try {
    const { hotelId, startDate, endDate } = req.query;
    const { hotelIds, hotels, isAdminScope } = await getManagerHotelScope(req);

    let effectiveHotelIds = hotelIds;
    if (hotelId) {
      const requestedHotelId = new mongoose.Types.ObjectId(hotelId);
      const isAuthorized = hotelIds.some((id) => id.toString() === requestedHotelId.toString());

      if (!isAuthorized && !isAdminScope) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to access report data for this hotel.',
        });
      }

      effectiveHotelIds = [requestedHotelId];
    }

    const match = {
      hotelId: { $in: effectiveHotelIds },
      ...getBookingDateFilter(startDate, endDate),
    };

    const totalBookings = await Booking.countDocuments(match);
    const statusRows = await Booking.aggregate([
      { $match: match },
      { $group: { _id: '$bookingStatus', count: { $sum: 1 } } },
    ]);
    const bookingStatusBreakdown = normalizeStatusBreakdown(statusRows);

    const roomStats = await Room.aggregate([
      { $match: { hotelId: { $in: effectiveHotelIds } } },
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          availableRooms: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
          maintenanceRooms: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } },
          occupiedRooms: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
          averagePricePerNight: { $avg: '$pricePerNight' },
        },
      },
    ]);

    const roomData = roomStats[0] || {
      totalRooms: 0,
      availableRooms: 0,
      maintenanceRooms: 0,
      occupiedRooms: 0,
      averagePricePerNight: 0,
    };

    const revenue = await getRevenueSummary(match);

    const hotelBreakdown = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$hotelId',
          bookingCount: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } },
          confirmedCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'confirmed'] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'completed'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel',
        },
      },
      { $unwind: '$hotel' },
      {
        $project: {
          _id: 0,
          hotelId: '$_id',
          hotelName: '$hotel.name',
          bookingCount: 1,
          revenue: 1,
          confirmedCount: 1,
          completedCount: 1,
        },
      },
      { $sort: { bookingCount: -1, revenue: -1 } },
    ]);

    const uniqueCustomers = await Booking.distinct('userId', match);

    res.status(200).json({
      success: true,
      data: {
        reportType: req.user.role === 'admin' ? 'admin-manager-view' : 'manager',
        period: { startDate: startDate || null, endDate: endDate || null },
        summary: {
          totalHotels: effectiveHotelIds.length,
          totalBookings,
          totalRooms: roomData.totalRooms,
          totalRevenue: revenue.totalRevenue,
          totalCustomers: uniqueCustomers.length,
          availableRooms: roomData.availableRooms,
        },
        bookingStatusBreakdown,
        revenue,
        roomStats: roomData,
        hotelBreakdown,
        userStats: {
          totalCustomers: uniqueCustomers.length,
          totalManagers: req.user.role === 'admin' ? await User.countDocuments({ role: 'hotel_manager' }) : 1,
        },
        managedHotels: hotels.map((hotel) => ({
          _id: hotel._id,
          name: hotel.name,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminReports = async (req, res, next) => {
  try {
    const { hotelId, startDate, endDate } = req.query;
    const match = {};

    if (hotelId) {
      match.hotelId = new mongoose.Types.ObjectId(hotelId);
    }

    const dateFilter = getBookingDateFilter(startDate, endDate);
    Object.assign(match, dateFilter);

    const [totalUsers, totalHotels, totalRooms, totalBookings, totalCustomers, totalManagers, totalAdmins] = await Promise.all([
      User.countDocuments(),
      Hotel.countDocuments(),
      Room.countDocuments(),
      Booking.countDocuments(match),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'hotel_manager' }),
      User.countDocuments({ role: 'admin' }),
    ]);

    const statusRows = await Booking.aggregate([
      { $match: match },
      { $group: { _id: '$bookingStatus', count: { $sum: 1 } } },
    ]);

    const roomStats = await Room.aggregate([
      { $match: hotelId ? { hotelId: new mongoose.Types.ObjectId(hotelId) } : {} },
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          availableRooms: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
          maintenanceRooms: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } },
          occupiedRooms: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
          averagePricePerNight: { $avg: '$pricePerNight' },
        },
      },
    ]);

    const roomData = roomStats[0] || {
      totalRooms: 0,
      availableRooms: 0,
      maintenanceRooms: 0,
      occupiedRooms: 0,
      averagePricePerNight: 0,
    };

    const revenue = await getRevenueSummary(match);
    const bookingStatusBreakdown = normalizeStatusBreakdown(statusRows);

    const hotelBreakdown = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$hotelId',
          bookingCount: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } },
          confirmedCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'confirmed'] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'completed'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel',
        },
      },
      { $unwind: '$hotel' },
      {
        $project: {
          _id: 0,
          hotelId: '$_id',
          hotelName: '$hotel.name',
          bookingCount: 1,
          revenue: 1,
          confirmedCount: 1,
          completedCount: 1,
        },
      },
      { $sort: { bookingCount: -1, revenue: -1 } },
    ]);

    const userRoleBreakdown = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        reportType: 'admin',
        period: { startDate: startDate || null, endDate: endDate || null },
        summary: {
          totalUsers,
          totalHotels,
          totalRooms,
          totalBookings,
          totalRevenue: revenue.totalRevenue,
          confirmedRevenue: revenue.confirmedRevenue,
          completedRevenue: revenue.completedRevenue,
        },
        bookingStatusBreakdown,
        revenue,
        roomStats: roomData,
        hotelBreakdown,
        userStats: {
          totalUsers,
          totalCustomers,
          totalManagers,
          totalAdmins,
          roleBreakdown: userRoleBreakdown,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
