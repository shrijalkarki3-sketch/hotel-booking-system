import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * Protect routes - Verifies JWT token & attaches user object to req.user
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'hotel_booking_jwt_secret_key_2026_dev_mode'
      );
    } catch (error) {
      console.error('[Auth Error] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Invalid or expired authentication token',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database temporarily unavailable. Please try again shortly.',
      });
    }

    try {
      // Fetch user without password
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized - User account no longer exists',
        });
      }

      if (user.status === 'blocked') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended by an administrator.',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('[Auth Error] User lookup failed:', error.message);
      return res.status(503).json({
        success: false,
        message: 'Authentication service temporarily unavailable. Please try again.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - No authentication token provided',
    });
  }
};

/**
 * Role Authorization Middleware
 * Restricts access to specified user roles e.g. authorize('admin', 'hotel_manager')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Please authenticate first',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden - User role '${req.user.role}' is not authorized to access this route. Requires one of: ${roles.join(', ')}`,
      });
    }

    next();
  };
};
