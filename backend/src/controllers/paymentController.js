import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { PaymentService } from '../services/payment/PaymentService.js';

/**
 * @desc    Initiate payment checkout session for a booking
 * @route   POST /api/v1/payments/initiate
 * @access  Private (Customer)
 */
export const initiatePayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod, gateway } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid bookingId',
      });
    }

    const result = await PaymentService.initiatePayment({
      bookingId,
      user: req.user,
      paymentMethod: paymentMethod || 'card',
      gatewayName: gateway || 'mock',
    });

    res.status(200).json({
      success: true,
      message: 'Payment session initiated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify payment transaction result and synchronize booking status
 * @route   POST /api/v1/payments/verify
 * @access  Private (Customer) / Public (Webhook Callback)
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { transactionId, gatewayReference, payload, simulatedStatus, gateway } = req.body;

    if (!transactionId && !gatewayReference) {
      return res.status(400).json({
        success: false,
        message: 'Please provide transactionId or gatewayReference',
      });
    }

    const verificationPayload = {
      ...(payload || {}),
      ...(simulatedStatus ? { simulatedStatus } : {}),
    };

    const result = await PaymentService.verifyPayment({
      transactionId,
      gatewayReference,
      payload: verificationPayload,
      gatewayName: gateway,
    });

    res.status(200).json({
      success: true,
      message: `Payment status processed: ${result.payment.paymentStatus}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment record for a specific booking
 * @route   GET /api/v1/payments/booking/:bookingId
 * @access  Private (Owner / Manager / Admin)
 */
export const getPaymentByBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ bookingId: req.params.bookingId })
      .populate('bookingId', 'checkIn checkOut totalAmount bookingStatus paymentStatus')
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found for this booking',
      });
    }

    // Ownership & Role Access Control Guard
    const isOwner = payment.userId._id.toString() === req.user._id.toString();
    const isAdminOrManager = ['admin', 'hotel_manager'].includes(req.user.role);

    if (!isOwner && !isAdminOrManager) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You cannot view another customer’s payment details',
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer payment history
 * @route   GET /api/v1/payments/history
 * @access  Private (Customer)
 */
export const getPaymentHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = { userId: req.user._id };

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate({
        path: 'bookingId',
        populate: { path: 'hotelId', select: 'name images location' },
      })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};
