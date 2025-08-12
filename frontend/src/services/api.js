import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response, config } = error;

    // Skip automatic error messages for payment requests (for debugging)
    const skipAutoError = config?.url?.includes('/payment/request');

    if (response) {
      const { status, data } = response;

      // Always handle 401 regardless of skipAutoError
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userData');

        if (window.location.pathname !== '/login' &&
            window.location.pathname !== '/admin/login' &&
            window.location.pathname !== '/') {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
        }
      } else if (!skipAutoError) {
        // Show automatic error messages for non-payment requests
        switch (status) {
          case 403:
            toast.error('Access denied. Insufficient permissions.');
            break;

          case 404:
            toast.error('Resource not found.');
            break;

          case 422:
            // Validation errors
            if (data.errors && Array.isArray(data.errors)) {
              data.errors.forEach(error => {
                toast.error(error.msg || error.message);
              });
            } else {
              toast.error(data.message || 'Validation failed.');
            }
            break;

          case 429:
            toast.error('Too many requests. Please try again later.');
            break;

          case 500:
            toast.error('Server error. Please try again later.');
            break;

          default:
            toast.error(data.message || 'An unexpected error occurred.');
        }
      }
    } else if (error.request && !skipAutoError) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else if (!skipAutoError) {
      // Other error
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

export default api;
