import API from './api';

// Customer Analytics
export const getCustomerStats = async () => {
  const response = await API.get('/analytics/customer');
  return response.data;
};

// Manager Analytics & Management
export const getManagerStats = async () => {
  const response = await API.get('/analytics/manager');
  return response.data;
};

export const getManagerHotels = async () => {
  const response = await API.get('/hotels/manager/my-hotels');
  return response.data;
};

export const createHotel = async (data) => {
  const response = await API.post('/hotels', data);
  return response.data;
};

export const updateHotel = async (id, data) => {
  const response = await API.put(`/hotels/${id}`, data);
  return response.data;
};

export const deleteHotel = async (id) => {
  const response = await API.delete(`/hotels/${id}`);
  return response.data;
};

export const createRoom = async (hotelId, data) => {
  const response = await API.post(`/hotels/${hotelId}/rooms`, data);
  return response.data;
};

export const updateRoom = async (id, data) => {
  const response = await API.put(`/hotels/rooms/${id}`, data);
  return response.data;
};

export const deleteRoom = async (id) => {
  const response = await API.delete(`/hotels/rooms/${id}`);
  return response.data;
};

export const getManagerBookings = async (params = {}) => {
  const response = await API.get('/bookings/manager/all', { params });
  return response.data;
};

export const updateBookingStatus = async (id, bookingStatus) => {
  const response = await API.patch(`/bookings/${id}/status`, { bookingStatus });
  return response.data;
};

// Admin Analytics & User Management
export const getAdminStats = async () => {
  const response = await API.get('/analytics/admin');
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await API.get('/users', { params });
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await API.patch(`/users/${id}/status`, { status });
  return response.data;
};
