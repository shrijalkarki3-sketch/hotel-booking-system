import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { createNotification } from '../utils/notificationHelper.js';

/**
 * Helper to recalculate and update hotel average rating in DB
 * @param {string|ObjectId} hotelId
 */
const recalculateHotelRating = async (hotelId) => {
  const hId = new mongoose.Types.ObjectId(hotelId);

  const stats = await Review.aggregate([
    { $match: { hotelId: hId, status: 'approved' } },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const average = stats.length > 0 ? Math.round(stats[0].average * 10) / 10 : 0;
  const count = stats.length > 0 ? stats[0].count : 0;

  await Hotel.findByIdAndUpdate(hotelId, {
    'rating.average': average,
    'rating.count': count,
  });

  return { average, count };
};

/**
 * @desc    Check review eligibility for a customer at a hotel
 * @route   GET /api/v1/reviews/eligibility/:hotelId
 * @access  Private (Customer)
 */
export const checkEligibility = async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const userId = req.user._id;

    // Find completed bookings for this user at this hotel
    const completedBookings = await Booking.find({
      userId,
      hotelId,
      bookingStatus: 'completed',
    }).select('_id checkIn checkOut');

    if (completedBookings.length === 0) {
      return res.status(200).json({
        success: true,
        eligible: false,
        message: 'You can only review hotels where you have completed a stay.',
        eligibleBookings: [],
      });
    }

    // Check which completed bookings do NOT have a review yet
    const bookingIds = completedBookings.map((b) => b._id);
    const existingReviews = await Review.find({
      bookingId: { $in: bookingIds },
    }).select('bookingId');

    const reviewedBookingIds = existingReviews.map((r) => r.bookingId.toString());
    const eligibleBookings = completedBookings.filter(
      (b) => !reviewedBookingIds.includes(b._id.toString())
    );

    return res.status(200).json({
      success: true,
      eligible: eligibleBookings.length > 0,
      message: eligibleBookings.length > 0
        ? 'You are eligible to review this hotel!'
        : 'You have already submitted reviews for all your completed stays at this hotel.',
      eligibleBookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a verified stay review
 * @route   POST /api/v1/reviews
 * @access  Private (Customer)
 */
export const createReview = async (req, res, next) => {
  try {
    const { hotelId, bookingId, rating, comment } = req.body;
    const userId = req.user._id;

    // 1. Validation
    if (!hotelId || !bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide hotelId, bookingId, rating (1-5), and comment',
      });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5 || !Number.isInteger(ratingNum)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5 stars',
      });
    }

    // 2. Verify Booking Eligibility
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found' });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You cannot submit a review for another customer’s booking',
      });
    }

    if (booking.hotelId.toString() !== hotelId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Booking does not match the specified hotel',
      });
    }

    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Review creation rejected - You can only review completed stays',
      });
    }

    // 3. Prevent Duplicate Reviews
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this booking',
      });
    }

    // 4. Create Review (Default status: approved for verified stay reviews)
    const review = await Review.create({
      userId,
      hotelId,
      bookingId,
      rating: ratingNum,
      comment: comment.trim(),
      status: 'approved',
    });

    // 5. Recalculate Hotel Average Rating
    await recalculateHotelRating(hotelId);

    // 6. Dispatch Notifications to Manager & Admin
    const hotel = await Hotel.findById(hotelId);
    if (hotel?.managerId) {
      await createNotification({
        userId: hotel.managerId,
        type: 'review_submitted',
        title: 'New Guest Review Posted',
        message: `A guest rated ${hotel.name} ${ratingNum} stars: "${comment.substring(0, 60)}..."`,
        relatedEntityId: review._id,
        relatedEntityType: 'Review',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your verified stay review has been published.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get published reviews & rating distribution for a hotel
 * @route   GET /api/v1/hotels/:hotelId/reviews
 * @access  Public
 */
export const getHotelReviews = async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const hId = new mongoose.Types.ObjectId(hotelId);

    // 1. Calculate Rating Distribution (1 to 5 stars percentages)
    const distributionRaw = await Review.aggregate([
      { $match: { hotelId: hId, status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalApproved = distributionRaw.reduce((sum, item) => sum + item.count, 0);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const distributionPct = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    distributionRaw.forEach((item) => {
      distribution[item._id] = item.count;
      distributionPct[item._id] = totalApproved > 0 ? Math.round((item.count / totalApproved) * 100) : 0;
    });

    // 2. Fetch paginated approved reviews
    const total = await Review.countDocuments({ hotelId, status: 'approved' });
    const reviews = await Review.find({ hotelId, status: 'approved' })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      summary: {
        totalReviews: totalApproved,
        distribution,
        distributionPct,
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer's submitted reviews
 * @route   GET /api/v1/reviews/my-reviews
 * @access  Private (Customer)
 */
export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('hotelId', 'name location images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a customer's review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private (Owner Customer)
 */
export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review record not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You can only edit your own review',
      });
    }

    if (rating !== undefined) {
      const rNum = Number(rating);
      if (isNaN(rNum) || rNum < 1 || rNum > 5 || !Number.isInteger(rNum)) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5 stars',
        });
      }
      review.rating = rNum;
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();
    await recalculateHotelRating(review.hotelId);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for Admin moderation
 * @route   GET /api/v1/reviews/admin/all
 * @access  Private (Admin Only)
 */
export const adminGetReviews = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && ['pending', 'approved', 'rejected', 'hidden'].includes(status)) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('userId', 'name email')
      .populate('hotelId', 'name location')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin moderate review status (approve, reject, hide)
 * @route   PATCH /api/v1/reviews/:id/moderate
 * @access  Private (Admin Only)
 */
export const moderateReview = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'hidden'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, rejected, or hidden',
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review record not found' });
    }

    review.status = status;
    await review.save();

    // Recalculate hotel average rating to account for status change
    await recalculateHotelRating(review.hotelId);

    // Notify customer
    await createNotification({
      userId: review.userId,
      type: status === 'approved' ? 'review_approved' : 'review_rejected',
      title: `Review ${status.toUpperCase()}`,
      message: `Your review for hotel has been ${status} by system moderation.`,
      relatedEntityId: review._id,
      relatedEntityType: 'Review',
    });

    res.status(200).json({
      success: true,
      message: `Review moderation status updated to ${status}`,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
