import API from './api';

// Get notifications list + unread count
export const getNotifications = async (params = {}) => {
  const response = await API.get('/notifications', { params });
  return response.data;
};

// Mark single notification as read
export const markAsRead = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await API.patch('/notifications/read-all');
  return response.data;
};
