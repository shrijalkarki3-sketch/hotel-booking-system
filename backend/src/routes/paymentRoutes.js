import express from 'express';
import {
  initiatePayment,
  verifyPayment,
  getPaymentByBooking,
  getPaymentHistory,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected Routes
router.use(protect);

router.post('/initiate', initiatePayment);
router.post('/verify', verifyPayment);
router.get('/booking/:bookingId', getPaymentByBooking);
router.get('/history', getPaymentHistory);

export default router;
