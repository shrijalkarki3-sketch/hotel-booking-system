import API from './api';

// Check customer review eligibility
export const checkEligibility = async (hotelId) => {
  const response = await API.get(`/reviews/eligibility/${hotelId}`);
  return response.data;
};

// Create verified stay review
export const createReview = async (data) => {
  const response = await API.post('/reviews', data);
  return response.data;
};

// Get hotel public reviews & rating distribution summary
export const getHotelReviews = async (hotelId, params = {}) => {
  const response = await API.get(`/reviews/hotel/${hotelId}`, { params });
  return response.data;
};

// Get customer's submitted reviews
export const getMyReviews = async () => {
  const response = await API.get('/reviews/my-reviews');
  return response.data;
};

// Edit review
export const updateReview = async (id, data) => {
  const response = await API.put(`/reviews/${id}`, data);
  return response.data;
};

// Admin Moderate review
export const moderateReview = async (id, status) => {
  const response = await API.patch(`/reviews/${id}/moderate`, { status });
  return response.data;
};

// Admin Get all reviews
export const adminGetReviews = async (params = {}) => {
  const response = await API.get('/reviews/admin/all', { params });
  return response.data;
};
