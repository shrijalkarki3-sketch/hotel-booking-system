/**
 * Date and Booking Validation Helper Utilities
 */

const normalizeDateOnly = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Calculate difference in nights between check-in and check-out
 * @param {Date|string} checkIn
 * @param {Date|string} checkOut
 * @returns {number} Number of nights
 */
export const calculateNights = (checkIn, checkOut) => {
  const start = normalizeDateOnly(checkIn);
  const end = normalizeDateOnly(checkOut);

  if (!start || !end) {
    return 0;
  }

  const diffTime = end.getTime() - start.getTime();
  return diffTime / (1000 * 3600 * 24);
};

/**
 * Validate Check-in and Check-out Date Rules
 * @param {Date|string} checkIn
 * @param {Date|string} checkOut
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateBookingDates = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) {
    return { valid: false, message: 'Please provide both check-in and check-out dates' };
  }

  const start = normalizeDateOnly(checkIn);
  const end = normalizeDateOnly(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!start || !end) {
    return { valid: false, message: 'Invalid check-in or check-out date format' };
  }

  // Check-in cannot be in the past (before today)
  if (start < today) {
    return { valid: false, message: 'Check-in date cannot be in the past' };
  }

  // Check-out must be strictly after check-in
  if (end <= start) {
    return { valid: false, message: 'Check-out date must be after check-in date' };
  }

  return { valid: true };
};

/**
 * Service Policy: Determine if a booking can be cancelled
 * @param {Object} booking - Mongoose Booking Document
 * @returns {{ canCancel: boolean, reason?: string }}
 */
export const canCancelBooking = (booking) => {
  if (!booking) {
    return { canCancel: false, reason: 'Booking record not found' };
  }

  if (booking.bookingStatus === 'cancelled') {
    return { canCancel: false, reason: 'Booking is already cancelled' };
  }

  if (booking.bookingStatus === 'completed') {
    return { canCancel: false, reason: 'Completed bookings cannot be cancelled' };
  }

  // Check-in date check: Policy allows cancellation before or on check-in date
  const checkInDate = normalizeDateOnly(booking.checkIn);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    return { canCancel: false, reason: 'Cannot cancel past bookings' };
  }

  return { canCancel: true };
};
