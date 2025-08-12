import api from './api';

export const authService = {
  // Set auth token in axios headers
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Remove auth token
  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },

  // Installer authentication
  registerInstaller: async (userData) => {
    console.log('🔍 AuthService registerInstaller called with:', userData);
    console.log('🔍 Using real backend API for installer registration');

    try {
      const response = await api.post('/auth/installer/register', userData);
      console.log('✅ Installer registered:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Installer registration failed:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  loginInstaller: async (credentials) => {
    console.log('🔍 AuthService loginInstaller called with:', credentials);
    console.log('🔍 Using real backend API for installer login');

    try {
      const response = await api.post('/auth/installer/login', credentials);
      console.log('✅ Installer login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Installer login failed:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Admin authentication
  loginAdmin: async (credentials) => {
    console.log('🔍 AuthService loginAdmin called with:', credentials);
    console.log('🔍 Using real backend API for admin login');

    try {
      const response = await api.post('/auth/admin/login', credentials);
      console.log('✅ Admin login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin login failed:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    console.log('🔍 AuthService getProfile called');
    console.log('🔍 Using real backend API for profile data');

    try {
      const response = await api.get('/installer/profile');
      console.log('✅ Profile data loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Profile data failed:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Update profile
  updateProfile: async (userData) => {
    console.log('🔍 AuthService updateProfile called with:', userData);
    console.log('🔍 Using real backend API for profile update');

    try {
      const response = await api.put('/installer/profile', userData);
      console.log('✅ Profile updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Update payment profile
  updatePaymentProfile: async (bankDetails) => {
    console.log('🔍 AuthService updatePaymentProfile called with:', bankDetails);
    console.log('🔍 Using real backend API for payment profile update');

    try {
      const response = await api.put('/installer/payment-profile', bankDetails);
      console.log('✅ Payment profile updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Payment profile update failed:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Update loyalty card
  updateLoyaltyCard: async (loyaltyCardData) => {
    console.log('🔍 AuthService updateLoyaltyCard called with:', loyaltyCardData);
    console.log('🔍 Using real backend API for loyalty card update');

    try {
      const response = await api.put('/installer/loyalty-card', loyaltyCardData);
      console.log('✅ Loyalty card updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Loyalty card update failed:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    console.log('🔍 AuthService forgotPassword called with:', email);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      console.log('✅ Forgot password response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Forgot password failed:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    console.log('🔍 AuthService resetPassword called with token:', token);

    try {
      const response = await api.put(`/auth/reset-password/${token}`, { password });
      console.log('✅ Reset password response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Reset password failed:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }
};
