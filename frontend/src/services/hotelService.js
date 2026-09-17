import API from './api';

/**
 * Fetch hotels with search query, filters, and pagination
 * @param {Object} params - Search filter parameters
 */
export const getHotels = async (params = {}) => {
  const response = await API.get('/hotels', { params });
  return response.data;
};

/**
 * Fetch single hotel details by ID with rooms and reviews
 * @param {string} id - Hotel ObjectId
 */
export const getHotelById = async (id) => {
  const response = await API.get(`/hotels/${id}`);
  return response.data;
};

/**
 * Fetch popular destination cities with hotel counts
 */
export const getPopularDestinations = async () => {
  const response = await API.get('/hotels/destinations/popular');
  return response.data;
};
