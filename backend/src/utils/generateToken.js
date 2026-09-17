import jwt from 'jsonwebtoken';

/**
 * Generate JWT token signed with user ID and secret
 * @param {string} id - User ObjectId string
 * @returns {string} Signed JWT token
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hotel_booking_jwt_secret_key_2026_dev_mode', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};
