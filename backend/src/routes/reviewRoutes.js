import express from 'express';
import {
  checkEligibility,
  createReview,
  getHotelReviews,
  getMyReviews,
  updateReview,
  adminGetReviews,
  moderateReview,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route: Get hotel reviews & rating distribution summary
router.get('/hotel/:hotelId', getHotelReviews);

// Protected Customer Routes
router.use(protect);

router.get('/eligibility/:hotelId', checkEligibility);
router.post('/', createReview);
router.get('/my-reviews', getMyReviews);
router.put('/:id', updateReview);

// Admin Moderation Routes
router.get('/admin/all', authorize('admin'), adminGetReviews);
router.patch('/:id/moderate', authorize('admin'), moderateReview);

export default router;
