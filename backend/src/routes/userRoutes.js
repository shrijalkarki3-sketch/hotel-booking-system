import express from 'express';
import { getUsers, updateUserStatus } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes below & restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.patch('/:id/status', updateUserStatus);

export default router;
