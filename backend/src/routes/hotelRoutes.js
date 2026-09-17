import express from 'express';
import {
  getHotels,
  getHotelById,
  getPopularDestinations,
  getManagerHotels,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../controllers/hotelController.js';
import {
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getHotels);
router.get('/destinations/popular', getPopularDestinations);

// Manager/admin hotel list must be registered before the public dynamic :id route.
router.get('/manager/my-hotels', protect, authorize('hotel_manager', 'admin'), getManagerHotels);

// Public detail route
router.get('/:id', getHotelById);

// Protected Manager / Admin Routes
router.use(protect);
router.use(authorize('hotel_manager', 'admin'));

router.post('/', createHotel);
router.put('/:id', updateHotel);
router.delete('/:id', deleteHotel);

// Room Management Routes
router.post('/:hotelId/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

export default router;
