import api from './api';

export const promotionService = {
  // Get active promotions for installer
  getActivePromotions: async () => {
    console.log('🔍 PromotionService getActivePromotions called');
    console.log('🔍 Using real backend API for promotions');

    try {
      const response = await api.get('/installer/promotions/active');
      console.log('✅ Active promotions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get active promotions failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to load promotions');
      }
      throw error;
    }
  },

  // Join a promotion
  joinPromotion: async (promotionId) => {
    console.log('🔍 PromotionService joinPromotion called with:', promotionId);
    console.log('🔍 Using real backend API for joining promotion');

    try {
      const response = await api.post(`/installer/promotions/${promotionId}/join`);
      console.log('✅ Join promotion response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Join promotion failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to join promotion');
      }
      throw error;
    }
  },

  // Get promotion details
  getPromotionDetails: async (promotionId) => {
    console.log('🔍 PromotionService getPromotionDetails called with:', promotionId);
    console.log('🔍 Using real backend API for promotion details');

    try {
      const response = await api.get(`/installer/promotions/${promotionId}`);
      console.log('✅ Promotion details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get promotion details failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to load promotion details');
      }
      throw error;
    }
  },

  // Get individual promotion details and progress
  getPromotionProgress: async (promotionId) => {
    console.log('🔍 PromotionService getPromotionProgress called with:', promotionId);
    console.log('🔍 Using real backend API for promotion progress');

    try {
      const response = await api.get(`/installer/promotions/${promotionId}`);
      console.log('✅ Promotion progress response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get promotion progress failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to load promotion progress');
      }
      throw error;
    }
  },

  // Get installer's promotion history
  getPromotionHistory: async () => {
    console.log('🔍 PromotionService getPromotionHistory called');
    console.log('🔍 Using real backend API for promotion history');

    try {
      const response = await api.get('/installer/promotions/history');
      console.log('✅ Promotion history response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get promotion history failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to load promotion history');
      }
      throw error;
    }
  },

  // Get promotion dashboard stats for installer
  getPromotionDashboardStats: async () => {
    console.log('🔍 PromotionService getPromotionDashboardStats called');
    console.log('🔍 Using real backend API for promotion dashboard stats');

    try {
      const response = await api.get('/installer/promotions/stats');
      console.log('✅ Promotion dashboard stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get promotion dashboard stats failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to load promotion stats');
      }
      throw error;
    }
  },

  // Update reward status for a participant (Admin only)
  updateRewardStatus: async (participationId, newStatus) => {
    console.log('🔍 PromotionService updateRewardStatus called with:', participationId, newStatus);
    console.log('🔍 Using real backend API for updating reward status');

    try {
      const response = await api.put(`/admin/promotions/participation/${participationId}/reward`, {
        status: newStatus
      });
      console.log('✅ Update reward status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update reward status failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to update reward status');
      }
      throw error;
    }
  }
};
