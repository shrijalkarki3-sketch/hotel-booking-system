import API from './api';

/**
 * Initiate payment transaction for a booking
 * @param {Object} data - { bookingId, paymentMethod, gateway }
 */
export const initiatePayment = async (data) => {
  const response = await API.post('/payments/initiate', data);
  return response.data;
};

/**
 * Verify payment status with backend
 * @param {Object} data - { transactionId, gatewayReference, simulatedStatus, gateway }
 */
export const verifyPayment = async (data) => {
  const response = await API.post('/payments/verify', data);
  return response.data;
};

/**
 * Get payment details by booking ID
 * @param {string} bookingId - Booking ObjectId
 */
export const getPaymentByBooking = async (bookingId) => {
  const response = await API.get(`/payments/booking/${bookingId}`);
  return response.data;
};

/**
 * Get customer payment history list
 * @param {Object} params - Query params (page, limit)
 */
export const getPaymentHistory = async (params = {}) => {
  const response = await API.get('/payments/history', { params });
  return response.data;
};
