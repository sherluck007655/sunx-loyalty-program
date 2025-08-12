import api from './api';

export const installerService = {
  // Dashboard
  getDashboard: async () => {
    console.log('🔍 Installer getDashboard called');
    console.log('🔍 Using real backend API for dashboard data');

    try {
      const response = await api.get('/installer/dashboard');
      console.log('✅ Installer dashboard data loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Installer dashboard data failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to load dashboard data');
      }
      throw error;
    }
  },

  // Serial Numbers
  getSerialNumbers: async (page = 1, limit = 10, search = '') => {
    console.log('🔍 Installer getSerialNumbers called with:', { page, limit, search });
    console.log('🔍 Using real backend API for serial numbers');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (search && search.trim() !== '') {
        params.append('search', search.trim());
      }

      const response = await api.get(`/installer/serials?${params}`);
      console.log('✅ Installer serial numbers loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Installer serial numbers failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to load serial numbers');
      }
      throw error;
    }
  },

  addSerialNumber: async (serialData) => {
    console.log('🔍 Installer addSerialNumber called with:', serialData);
    console.log('🔍 Using real backend API');

    try {
      const response = await api.post('/serial/add', serialData);

      console.log('✅ Installer serial number added:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Installer add serial failed:', error);
      throw error;
    }
  },

  updateSerialNumber: async (id, serialData) => {
    console.log('🔍 Installer updateSerialNumber called with:', { id, serialData });
    console.log('🔍 Using real backend API');

    try {
      const response = await api.put(`/serial/${id}`, serialData);

      console.log('✅ Installer serial number updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Installer serial update failed:', error);
      throw error;
    }
  },

  deleteSerialNumber: async (id) => {
    console.log('🔍 Installer deleteSerialNumber called with:', id);
    console.log('🔍 Using real backend API');

    try {
      const response = await api.delete(`/serial/${id}`);

      console.log('✅ Installer serial number deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Installer serial deletion failed:', error);
      throw error;
    }
  },

  checkSerialNumber: async (serialNumber) => {
    console.log('🔍 Installer checkSerialNumber called with:', serialNumber);
    console.log('🔍 Using real backend API');

    try {
      const response = await api.get(`/serial/check/${serialNumber}`);

      console.log('✅ Installer serial check result:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Installer serial check failed:', error);
      throw error;
    }
  },

  // Payments
  getPaymentHistory: async (page = 1, limit = 10, status = '') => {
    console.log('🔍 getPaymentHistory called with:', { page, limit, status });
    console.log('🔍 Using real backend API');

    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);

      const response = await api.get(`/payment/history?${params}`);

      console.log('✅ Payment history response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Payment history failed:', error);
      throw error;
    }
  },

  requestPayment: async (paymentData) => {
    console.log('🔍 installerService.requestPayment called with:', paymentData);
    console.log('🔍 Using real backend API');

    try {
      const response = await api.post('/payment/request', paymentData);

      console.log('✅ Payment request successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Payment request failed:', error);
      throw error;
    }
  },

  getPaymentStats: async () => {
    const response = await api.get('/installer/payment/stats');
    return response.data;
  },

  // Promotions
  getActivePromotions: async () => {
    const response = await api.get('/installer/promotions/active');
    return response.data;
  },

  joinPromotion: async (promotionId) => {
    const response = await api.post(`/installer/promotions/${promotionId}/join`);
    return response.data;
  },

  getPromotionDetails: async (promotionId) => {
    const response = await api.get(`/installer/promotions/${promotionId}`);
    return response.data;
  },

  getPromotionHistory: async () => {
    const response = await api.get('/installer/promotions/history');
    return response.data;
  },

  // Claim milestone payment (now uses regular payment request)
  claimMilestonePayment: async (milestoneNumber) => {
    console.log('🔍 Installer claimMilestonePayment called with:', milestoneNumber);
    console.log('🔍 Using real backend API payment request');

    try {
      const paymentData = {
        amount: 5000, // Default milestone amount
        description: `Milestone ${milestoneNumber} payment request - ${milestoneNumber * 10} inverter installations completed`,
        paymentMethod: 'bank_transfer'
      };

      const response = await api.post('/payment/request', paymentData);

      console.log('✅ Installer milestone payment claimed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Installer milestone payment claim failed:', error);
      throw error;
    }
  },

  // Payment Comment Management
  addPaymentComment: async (paymentId, message) => {
    console.log('🔍 InstallerService addPaymentComment called with:', paymentId, message);
    console.log('🔍 Using real backend API');

    try {
      const response = await api.post(`/payment/${paymentId}/comments`, {
        message: message
      });
      console.log('✅ Add payment comment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Add payment comment failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Add payment receipt (removed - not implemented in backend)
  addPaymentReceipt: async (paymentId, receiptData) => {
    console.log('🔍 InstallerService addPaymentReceipt called with:', paymentId);
    console.log('⚠️ Payment receipts not implemented in backend yet');

    // Return success for now to avoid breaking the UI
    return {
      success: true,
      message: 'Receipt feature not available yet',
      data: null
    };
  },

  // Notification Management
  getNotifications: async (limit = 50) => {
    console.log('🔍 InstallerService getNotifications called');
    console.log('🔍 Using real backend API for notifications');

    try {
      const response = await api.get(`/installer/notifications?limit=${limit}`);
      console.log('✅ Installer notifications response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Installer get notifications failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to load notifications');
      }
      throw error;
    }
  },

  markNotificationAsRead: async (notificationId) => {
    console.log('🔍 InstallerService markNotificationAsRead called with:', notificationId);
    console.log('🔍 Using real backend API');

    try {
      const response = await api.put(`/installer/notifications/${notificationId}/read`);

      console.log('✅ Mark notification as read response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Mark notification as read failed:', error);
      throw error;
    }
  },

  markAllNotificationsAsRead: async () => {
    console.log('🔍 InstallerService markAllNotificationsAsRead called');
    console.log('🔍 Using real backend API for mark all notifications as read');

    try {
      const response = await api.put('/installer/notifications/read-all');
      console.log('✅ Mark all notifications as read response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Mark all notifications as read failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to mark all notifications as read');
      }
      throw error;
    }
  }
};
