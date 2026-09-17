import axios from 'axios';

// Create base Axios instance
const API = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append JWT token to every outgoing request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('grantstay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401 Unauthorized errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired auth session if token is invalid
      if (localStorage.getItem('grantstay_token')) {
        localStorage.removeItem('grantstay_token');
        localStorage.removeItem('grantstay_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
