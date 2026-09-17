import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updatePassword,
  logoutUser,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (Any logged-in user)
router.use(protect);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.post('/logout', logoutUser);

// Role Test Endpoints (Demonstrates RBAC functionality)
router.get('/customer-test', authorize('customer', 'hotel_manager', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Access granted: Customer role verified',
    user: req.user,
  });
});

router.get('/manager-test', authorize('hotel_manager', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Access granted: Hotel Manager role verified',
    user: req.user,
  });
});

router.get('/admin-test', authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Access granted: Administrator role verified',
    user: req.user,
  });
});

export default router;
