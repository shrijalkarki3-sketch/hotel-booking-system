import express from 'express';
import {
  getCustomerAnalytics,
  getManagerAnalytics,
  getAdminAnalytics,
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/customer', authorize('customer', 'admin'), getCustomerAnalytics);
router.get('/manager', authorize('hotel_manager', 'admin'), getManagerAnalytics);
router.get('/admin', authorize('admin'), getAdminAnalytics);

export default router;
