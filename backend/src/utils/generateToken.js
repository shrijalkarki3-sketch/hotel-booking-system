import jwt from 'jsonwebtoken';

/**
 * Generate JWT token signed with user ID and secret
 * @param {string} id - User ObjectId string
 * @returns {string} Signed JWT token
 */
export const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'hotel_booking_jwt_secret_key_2026_dev_mode' : null);

  if (!secret) {
    throw new Error('JWT_SECRET must be configured in production');
  }

  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};
