import API from './api';

/**
 * Check room availability for selected date range
 * @param {Object} data - { roomId, checkIn, checkOut }
 */
export const checkAvailability = async (data) => {
  const response = await API.post('/bookings/check-availability', data);
  return response.data;
};

/**
 * Create a new booking
 * @param {Object} bookingData - { hotelId, roomId, checkIn, checkOut, guests }
 */
export const createBooking = async (bookingData) => {
  const response = await API.post('/bookings', bookingData);
  return response.data;
};

/**
 * Get customer's booking history
 * @param {Object} params - Query params (status, page, limit)
 */
export const getMyBookings = async (params = {}) => {
  const response = await API.get('/bookings/my-bookings', { params });
  return response.data;
};

/**
 * Get single booking receipt by ID
 * @param {string} id - Booking ObjectId
 */
export const getBookingById = async (id) => {
  const response = await API.get(`/bookings/${id}`);
  return response.data;
};

/**
 * Cancel an eligible booking
 * @param {string} id - Booking ObjectId
 * @param {string} reason - Cancellation reason
 */
export const cancelBooking = async (id, reason = '') => {
  const response = await API.patch(`/bookings/${id}/cancel`, { reason });
  return response.data;
};
