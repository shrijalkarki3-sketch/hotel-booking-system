import express from 'express';
import {
  checkRoomAvailability,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getManagerBookings,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Preview availability endpoint
router.post('/check-availability', checkRoomAvailability);

// Protected Routes (Require Authentication)
router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);

// Manager / Admin Booking Management Endpoints
router.get('/manager/all', authorize('hotel_manager', 'admin'), getManagerBookings);
router.patch('/:id/status', authorize('hotel_manager', 'admin'), updateBookingStatus);

export default router;
