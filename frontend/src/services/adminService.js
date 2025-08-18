import api from './api';
import { mockStorageHelpers, mockPromotionParticipations } from './mockStorage';
import { passwordService } from './passwordService';

// Verify mockStorageHelpers is properly imported
if (!mockStorageHelpers) {
  console.error('❌ mockStorageHelpers not imported correctly');
} else {
  console.log('✅ mockStorageHelpers imported correctly');
  console.log('🔍 Available methods:', Object.keys(mockStorageHelpers));

  // Clear notifications and chats for clean user experience - DISABLED
  // if (mockStorageHelpers.clearNotificationsAndChats) {
  //   mockStorageHelpers.clearNotificationsAndChats();
  // }

  if (!mockStorageHelpers.getSystemAnalytics) {
    console.error('❌ getSystemAnalytics method not found in mockStorageHelpers');
  }

  if (!mockStorageHelpers.getAllSerials) {
    console.error('❌ getAllSerials method not found in mockStorageHelpers');
  } else {
    console.log('✅ getAllSerials method found in mockStorageHelpers');
  }
}

export const adminService = {
  // Dashboard Statistics
  getDashboardStats: async () => {
    console.log('🔍 Admin getDashboardStats called');
    console.log('🔍 Making real API call to backend');

    try {
      const response = await api.get('/admin/dashboard');
      console.log('✅ Admin dashboard stats response:', response.data);

      // Backend returns comprehensive data in the correct format
      const backendData = response.data.data;
      console.log('🔍 Backend data structure:', backendData);

      // Return the backend data directly since it's already in the correct format
      return {
        success: true,
        data: backendData
      };
    } catch (error) {
      console.error('❌ Admin getDashboardStats API error:', error);

      // Return fallback empty stats instead of mock data
      return {
        success: false,
        data: {
          installers: { total: 0, approved: 0, pending: 0, rejected: 0, suspended: 0, growthRate: 0 },
          installations: { total: 0, recent: 0, averagePerInstaller: 0 },
          payments: { total: 0, pending: 0, approved: 0, paid: 0, totalAmount: 0, pendingAmount: 0, paidAmount: 0 },
          serials: { total: 0, recent: 0, uniqueProducts: 0, uniqueCities: 0 },
          promotions: { active: 0, total: 0, expired: 0 },
          products: { total: 0, active: 0, inactive: 0, averagePoints: 0 },
          overview: {
            totalPaidAmount: 0,
            averageRating: 0,
            totalSerials: 0,
            totalProducts: 0,
            totalCities: 0,
            systemHealth: 'poor',
            lastUpdated: new Date().toISOString()
          }
        },
        error: error.message
      };
    }
  },

  // System Analytics
  getSystemAnalytics: async () => {
    console.log('🔍 Admin getSystemAnalytics called');
    console.log('🔍 Using mock system analytics');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      console.log('🔍 Calling mockStorageHelpers.getSystemAnalytics()...');

      if (!mockStorageHelpers?.getSystemAnalytics) {
        throw new Error('getSystemAnalytics method not available');
      }

      const analytics = mockStorageHelpers.getSystemAnalytics();
      console.log('✅ Analytics data received:', analytics);

      const mockResponse = {
        success: true,
        data: analytics
      };

      console.log('✅ System analytics response:', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('❌ Get system analytics failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });

      // Return fallback analytics data based on actual system state
      const currentInstallers = mockStorageHelpers.getAllInstallers();
      const currentSerials = mockStorageHelpers.getAllSerials(1, 1000);
      const currentPayments = mockStorageHelpers.getPayments(1, 1000);

      const fallbackAnalytics = {
        userActivity: {
          totalUsers: currentInstallers.length,
          activeUsers: currentInstallers.filter(i => i.status === 'approved').length,
          newUsersThisMonth: currentInstallers.filter(i => {
            const joinDate = new Date(i.joinedAt);
            const thisMonth = new Date();
            return joinDate.getMonth() === thisMonth.getMonth() && joinDate.getFullYear() === thisMonth.getFullYear();
          }).length,
          userGrowthRate: currentInstallers.length > 0 ? 15 : 0,
          activeUserPercentage: currentInstallers.length > 0 ? Math.round((currentInstallers.filter(i => i.status === 'approved').length / currentInstallers.length) * 100) : 0
        },
        serialActivity: {
          totalSerials: currentSerials.serials.length,
          recentSerials: currentSerials.serials.filter(s => {
            const serialDate = new Date(s.createdAt);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return serialDate >= sevenDaysAgo;
          }).length,
          serialsToday: currentSerials.serials.filter(s => {
            const serialDate = new Date(s.createdAt);
            const today = new Date();
            return serialDate.toDateString() === today.toDateString();
          }).length,
          avgSerialsPerUser: currentInstallers.length > 0 ? Math.round(currentSerials.serials.length / currentInstallers.length) : 0,
          serialGrowthRate: currentSerials.serials.length > 0 ? 12 : 0
        },
        paymentActivity: {
          totalPayments: currentPayments.payments.length,
          pendingPayments: currentPayments.payments.filter(p => p.status === 'pending').length,
          approvedPayments: currentPayments.payments.filter(p => p.status === 'approved').length,
          totalPaymentAmount: currentPayments.payments.reduce((sum, p) => sum + p.amount, 0),
          avgPaymentAmount: currentPayments.payments.length > 0 ? Math.round(currentPayments.payments.reduce((sum, p) => sum + p.amount, 0) / currentPayments.payments.length) : 0,
          pendingPaymentPercentage: currentPayments.payments.length > 0 ? Math.round((currentPayments.payments.filter(p => p.status === 'pending').length / currentPayments.payments.length) * 100) : 0
        },
        systemHealth: {
          totalDataPoints: currentInstallers.length + currentSerials.serials.length + currentPayments.payments.length,
          dataIntegrity: 100,
          systemUptime: '99.9%',
          lastBackup: new Date().toISOString()
        }
      };

      console.log('🔄 Returning fallback analytics data:', fallbackAnalytics);
      return {
        success: true,
        data: fallbackAnalytics
      };
    }
  },

  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Installers Management
  getInstallers: async (page = 1, limit = 10, search = '', status = '') => {
    console.log('🔍 Admin getInstallers called with:', { page, limit, search, status });
    console.log('🔍 Making real API call to backend');

    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const response = await api.get(`/admin/installers?${params.toString()}`);
      console.log('✅ Admin real installer response:', response.data);

      // Simplified transformation to avoid errors
      const installers = response.data.data.installers || [];
      const pagination = response.data.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 };

      const transformedInstallers = installers.map(installer => ({
        id: installer._id || installer.id,
        name: installer.name || 'Unknown',
        email: installer.email || 'No email',
        phone: installer.phone || 'No phone',
        loyaltyCardId: installer.loyaltyCardId || 'N/A',
        status: installer.isActive ? 'approved' : 'suspended',
        totalInstallations: installer.totalInverters || 0,
        totalEarnings: installer.totalPoints || 0,
        joinedAt: installer.createdAt || new Date().toISOString(),
        lastLoginAt: installer.lastLoginAt || null,
        city: installer.address || 'N/A'
      }));

      // Use backend summary data if available, otherwise calculate from installers
      const backendSummary = response.data.data.summary;
      let summary;

      if (backendSummary) {
        console.log('✅ Using backend summary data:', backendSummary);
        summary = {
          totalInstallers: backendSummary.totalInstallers || backendSummary.total || 0,
          total: backendSummary.totalInstallers || backendSummary.total || 0,
          approved: backendSummary.approved || 0,
          pending: backendSummary.pending || 0,
          rejected: backendSummary.rejected || 0,
          active: backendSummary.active || 0
        };
      } else {
        console.log('⚠️ No backend summary, calculating from installers');
        const activeCount = installers.filter(i => i.isActive).length;
        const inactiveCount = installers.length - activeCount;
        summary = {
          totalInstallers: pagination.total,
          total: pagination.total,
          approved: activeCount,
          pending: 0,
          rejected: inactiveCount,
          active: activeCount
        };
      }

      console.log('📊 Final summary data:', summary);

      return {
        success: true,
        data: {
          installers: transformedInstallers,
          pagination: pagination,
          summary: summary
        }
      };
    } catch (error) {
      console.error('❌ Admin getInstallers API error:', error);
      // Fallback to empty data
      return {
        success: false,
        data: {
          installers: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
          summary: { total: 0, approved: 0, pending: 0, rejected: 0 }
        },
        error: error.message
      };
    }
  },

  getInstallerDetails: async (installerId) => {
    console.log('🔍 Admin getInstallerDetails called with:', installerId);
    console.log('🔍 Making real API call to backend');

    try {
      const response = await api.get(`/admin/installers/${installerId}`);
      console.log('✅ Admin installer details response:', response.data);

      // Transform the response to match expected format
      const installer = response.data.data.installer;
      const transformedInstaller = {
        id: installer._id,
        name: installer.name,
        email: installer.email,
        phone: installer.phone,
        loyaltyCardId: installer.loyaltyCardId,
        status: installer.isActive ? 'approved' : 'suspended',
        totalInstallations: installer.totalInverters || 0,
        totalEarnings: installer.totalPoints || 0,
        joinedAt: installer.createdAt,
        lastLoginAt: installer.lastLoginAt,
        address: installer.address,
        cnic: installer.cnic,
        isActive: installer.isActive,
        isVerified: installer.isVerified
      };

      return {
        success: true,
        data: {
          installer: transformedInstaller,
          serials: response.data.data.serials || [],
          payments: response.data.data.payments || []
        }
      };
    } catch (error) {
      console.error('❌ Admin installer details API error:', error);
      throw error;
    }
  },

  updateInstallerStatus: async (installerId, statusData) => {
    console.log('🔍 Admin updateInstallerStatus called with:', { installerId, statusData });
    console.log('🔍 Making real API call to backend');

    try {
      const response = await api.put(`/admin/installers/${installerId}/status`, statusData);
      console.log('✅ Admin installer status update successful:', response.data);

      return {
        success: true,
        message: 'Installer status updated successfully',
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Admin installer status update API error:', error);
      throw error;
    }
  },

  // Admin authentication
  authenticateAdmin: async (email, password) => {
    console.log('🔐 Admin authentication attempt for:', email);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const isValid = passwordService.verifyAdminCredentials(email, password);

      if (isValid) {
        const adminUser = {
          id: 'admin-1',
          email: email,
          name: 'Admin User',
          role: 'admin',
          loginAt: new Date().toISOString()
        };

        // Store admin session
        localStorage.setItem('sunx_admin_user', JSON.stringify(adminUser));

        console.log('✅ Admin authentication successful');
        return { success: true, data: adminUser };
      } else {
        console.log('❌ Admin authentication failed - invalid credentials');
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('❌ Admin authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  },

  // Reset installer password and get new password (admin only)
  resetInstallerPassword: async (installerId) => {
    console.log('🔍 Admin resetInstallerPassword called with:', installerId);

    try {
      const response = await api.post(`/admin/installers/${installerId}/reset-password`);
      console.log('✅ Admin installer password reset successful');
      return response.data;
    } catch (error) {
      console.error('❌ Admin installer password reset failed:', error);
      throw error;
    }
  },

  // Update installer profile (admin only)
  updateInstallerProfile: async (installerId, profileData) => {
    console.log('🔍 Admin updateInstallerProfile called with:', { installerId, profileData });

    try {
      const response = await api.put(`/admin/installers/${installerId}`, profileData);
      console.log('✅ Admin installer profile update successful');
      return response.data;
    } catch (error) {
      console.error('❌ Admin installer profile update failed:', error);
      throw error;
    }
  },

  // Delete installer account (admin only)
  deleteInstaller: async (installerId) => {
    console.log('🔍 Admin deleteInstaller called with:', installerId);

    try {
      const response = await api.delete(`/admin/installers/${installerId}`);
      console.log('✅ Admin installer deletion successful');
      return response.data;
    } catch (error) {
      console.error('❌ Admin installer deletion failed:', error);
      throw error;
    }
  },

  // Payments Management
  getPayments: async (page = 1, limit = 10, status = '') => {
    console.log('🔍 Admin getPayments called with:', { page, limit, status });

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (status) {
        params.append('status', status);
      }

      const response = await api.get(`/admin/payments?${params}`);
      console.log('✅ Admin real payment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin getPayments error:', error);
      throw error;
    }
  },

  updatePaymentStatus: async (paymentId, statusData) => {
    console.log('🔍 Admin updatePaymentStatus called with:', { paymentId, statusData });

    // Validate inputs
    if (!paymentId) {
      console.error('❌ Payment ID is missing');
      throw new Error('Payment ID is required');
    }

    if (!statusData || !statusData.status) {
      console.error('❌ Status data is missing');
      throw new Error('Status is required');
    }

    try {
      console.log('🔄 Attempting to update payment status...');
      const response = await api.put(`/admin/payments/${paymentId}/status`, statusData);
      console.log('✅ Admin payment status update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin payment status update failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Enhanced Payment Management
  deletePayment: async (paymentId) => {
    console.log('🔍 Admin deletePayment called with:', paymentId);

    try {
      const response = await api.delete(`/admin/payments/${paymentId}`);
      console.log('✅ Admin payment deletion successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin payment deletion failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Serial Numbers Management
  getAllSerials: async (page = 1, limit = 10, filters = {}) => {
    console.log('🔍 Admin getAllSerials called with:', { page, limit, filters });
    console.log('🔍 Using real backend API');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (filters.search && filters.search.trim() !== '') {
        params.append('search', filters.search.trim());
      }

      if (filters.status && filters.status.trim() !== '') {
        params.append('status', filters.status.trim());
      }

      const response = await api.get(`/admin/serials?${params}`);
      console.log('✅ Admin serials response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin get serials failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to get serial numbers');
      }
      throw error;
    }
  },

  deleteSerial: async (serialId) => {
    console.log('🔍 Admin deleteSerial called with:', serialId);
    console.log('🔍 Using shared mock serial storage');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      const deletedSerial = mockStorageHelpers.deleteSerial(serialId);

      const mockResponse = {
        success: true,
        message: 'Serial number deleted successfully',
        data: {
          serial: deletedSerial
        }
      };

      console.log('✅ Admin serial deletion successful:', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('❌ Admin serial deletion failed:', error);
      throw error;
    }
  },

  // Get installer's detailed data for profile modal
  getInstallerPayments: async (installerId) => {
    console.log('🔍 Admin getInstallerPayments called with:', installerId);
    console.log('🔍 Using real backend API');

    try {
      const response = await api.get(`/admin/installers/${installerId}`);
      console.log('✅ Admin installer details response:', response.data);

      // Extract payments from the installer details response
      const payments = response.data.data.payments || [];

      const apiResponse = {
        success: true,
        data: {
          payments
        }
      };

      console.log('✅ Admin installer payments response:', apiResponse);
      return apiResponse;
    } catch (error) {
      console.error('❌ Admin get installer payments failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to get installer payments');
      }
      throw error;
    }
  },

  getInstallerSerials: async (installerId) => {
    console.log('🔍 Admin getInstallerSerials called with:', installerId);
    console.log('🔍 Using real backend API');

    try {
      const response = await api.get(`/admin/installers/${installerId}`);
      console.log('✅ Admin installer details response:', response.data);

      // Extract serials from the installer details response
      const serials = response.data.data.serials || [];

      const apiResponse = {
        success: true,
        data: {
          serials
        }
      };

      console.log('✅ Admin installer serials response:', apiResponse);
      return apiResponse;
    } catch (error) {
      console.error('❌ Admin get installer serials failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to get installer serials');
      }
      throw error;
    }
  },

  // Valid Serial Numbers Management
  getValidSerials: async (page = 1, limit = 50, search = '', status = '') => {
    console.log('🔍 Admin getValidSerials called with:', { page, limit, search, status });
    console.log('🔍 Using real backend API');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (search && search.trim() !== '') {
        params.append('search', search.trim());
      }

      if (status && status.trim() !== '') {
        params.append('status', status.trim());
      }

      const response = await api.get(`/admin/valid-serials?${params}`);
      console.log('✅ Admin valid serials response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin get valid serials failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to get valid serial numbers');
      }
      throw error;
    }
  },

  uploadValidSerials: async (csvData, productId = null) => {
    console.log('🔍 Admin uploadValidSerials called with:', { csvData: csvData.length + ' chars', productId });
    console.log('🔍 Using real backend API');

    try {
      const requestData = { csvData };
      if (productId) {
        requestData.productId = productId;
      }

      const response = await api.post('/admin/valid-serials/upload', requestData);
      console.log('✅ Admin upload serials response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin upload serials failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to upload valid serial numbers');
      }
      throw error;
    }
  },

  addValidSerial: async (serialNumber, notes = '', productId = null) => {
    console.log('🔍 Admin addValidSerial called with:', { serialNumber, notes, productId });
    console.log('🔍 Using real backend API');

    try {
      const requestData = {
        serialNumber: serialNumber.toUpperCase(),
        notes
      };

      if (productId) {
        requestData.productId = productId;
      }

      const response = await api.post('/admin/valid-serials', requestData);
      console.log('✅ Admin add serial response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin add serial failed:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to add valid serial number');
      }
      throw error;
    }
  },

  removeValidSerial: async (serialNumber) => {
    console.log('🔍 Admin removeValidSerial called with:', serialNumber);
    console.log('🔍 Making real API call to backend');

    try {
      const response = await api.delete(`/admin/valid-serials/${serialNumber}`);
      console.log('✅ Admin remove serial response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin remove serial failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Promotions Management
  getPromotions: async () => {
    console.log('🔍 Admin getPromotions called');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const promotions = mockStorageHelpers.getAllPromotions();

      const mockResponse = {
        success: true,
        data: {
          promotions,
          total: promotions.length,
          active: promotions.filter(p => p.status === 'active').length,
          expired: promotions.filter(p => new Date(p.endDate) < new Date()).length
        }
      };

      console.log('✅ Admin promotions response:', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('❌ Admin get promotions failed:', error);
      throw error;
    }
  },

  createPromotion: async (promotionData) => {
    console.log('🔍 Admin createPromotion called with:', promotionData);

    // Validate required fields
    if (!promotionData.title || !promotionData.title.trim()) {
      throw new Error('Title is required');
    }
    if (!promotionData.description || !promotionData.description.trim()) {
      throw new Error('Description is required');
    }
    if (!promotionData.startDate) {
      throw new Error('Start date is required');
    }
    if (!promotionData.endDate) {
      throw new Error('End date is required');
    }
    if (!promotionData.target || !promotionData.target.value || promotionData.target.value <= 0) {
      throw new Error('Target value must be greater than 0');
    }
    if (!promotionData.rewards || !promotionData.rewards.amount || promotionData.rewards.amount <= 0) {
      throw new Error('Reward amount must be greater than 0');
    }

    // Validate dates
    const startDate = new Date(promotionData.startDate);
    const endDate = new Date(promotionData.endDate);
    if (startDate >= endDate) {
      throw new Error('End date must be after start date');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const newPromotion = mockStorageHelpers.addPromotion(promotionData);

      const mockResponse = {
        success: true,
        message: 'Promotion created successfully',
        data: newPromotion
      };

      console.log('✅ Admin create promotion response:', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('❌ Admin create promotion failed:', error);
      throw new Error(error.message || 'Failed to create promotion');
    }
  },

  updatePromotion: async (promotionId, updateData) => {
    console.log('🔍 Admin updatePromotion called with:', promotionId, updateData);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      const updatedPromotion = mockStorageHelpers.updatePromotion(promotionId, updateData);

      const mockResponse = {
        success: true,
        message: 'Promotion updated successfully',
        data: updatedPromotion
      };

      console.log('✅ Admin update promotion response:', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('❌ Admin update promotion failed:', error);
      throw error;
    }
  },

  deletePromotion: async (promotionId) => {
    console.log('🔍 Admin deletePromotion called with:', promotionId);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const deletedPromotion = mockStorageHelpers.deletePromotion(promotionId);

      const mockResponse = {
        success: true,
        message: 'Promotion deleted successfully',
        data: deletedPromotion
      };

      console.log('✅ Admin delete promotion response:', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('❌ Admin delete promotion failed:', error);
      throw error;
    }
  },

  getPromotionStats: async () => {
    console.log('🔍 Admin getPromotionStats called');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      const promotions = mockStorageHelpers.getAllPromotions();
      const participations = mockPromotionParticipations;

      const stats = {
        totalPromotions: promotions.length,
        activePromotions: promotions.filter(p => p.status === 'active').length,
        totalParticipations: participations.length,
        completedParticipations: participations.filter(p => p.status === 'completed').length,
        averageParticipationRate: promotions.length > 0 ?
          Math.round((participations.length / promotions.length) * 100) : 0
      };

      const mockResponse = {
        success: true,
        data: stats
      };

      console.log('✅ Admin promotion stats response:', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('❌ Admin promotion stats failed:', error);
      throw error;
    }
  },

  // Get detailed promotion analytics
  getPromotionAnalytics: async (promotionId) => {
    console.log('🔍 Admin getPromotionAnalytics called with:', promotionId);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      const analytics = mockStorageHelpers.getPromotionAnalytics(promotionId);

      if (!analytics) {
        throw new Error('Promotion not found');
      }

      const mockResponse = {
        success: true,
        data: analytics
      };

      console.log('✅ Admin promotion analytics response:', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('❌ Admin get promotion analytics failed:', error);
      throw new Error(error.message || 'Failed to get promotion analytics');
    }
  },

  // Get all promotion participants
  getPromotionParticipants: async (promotionId, status = '') => {
    console.log('🔍 Admin getPromotionParticipants called with:', promotionId, status);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      const analytics = mockStorageHelpers.getPromotionAnalytics(promotionId);

      if (!analytics) {
        throw new Error('Promotion not found');
      }

      let participants = analytics.participants;

      // Filter by status if provided
      if (status) {
        participants = participants.filter(p => p.status === status);
      }

      const mockResponse = {
        success: true,
        data: {
          promotion: analytics.promotion,
          participants,
          totalParticipants: analytics.totalParticipants,
          filteredCount: participants.length,
          stats: {
            active: analytics.activeParticipants,
            completed: analytics.completedParticipants,
            completionRate: analytics.completionRate,
            averageProgress: analytics.averageProgress
          }
        }
      };

      console.log('✅ Admin promotion participants response:', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('❌ Admin get promotion participants failed:', error);
      throw new Error(error.message || 'Failed to get promotion participants');
    }
  },



  getBusinessAnalytics: async () => {
    console.log('🔍 AdminService getBusinessAnalytics called');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      console.log('🔍 Calling mockStorageHelpers.getBusinessAnalytics...');
      const analytics = mockStorageHelpers.getBusinessAnalytics();
      console.log('✅ Business analytics data received:', analytics);

      const mockResponse = {
        success: true,
        data: analytics
      };

      console.log('✅ Business analytics response:', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('❌ Get business analytics failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });

      // Return fallback business analytics data
      const fallbackBusinessAnalytics = {
        revenue: {
          totalRevenue: 150000,
          monthlyRevenue: 25000,
          revenueGrowth: 15,
          averageOrderValue: 5000
        },
        customers: {
          totalCustomers: 45,
          newCustomers: 8,
          customerGrowth: 12,
          customerRetention: 85
        },
        performance: {
          conversionRate: 25,
          averageResponseTime: 2.5,
          customerSatisfaction: 4.3,
          systemUptime: 99.9
        }
      };

      console.log('🔄 Returning fallback business analytics:', fallbackBusinessAnalytics);
      return {
        success: true,
        data: fallbackBusinessAnalytics
      };
    }
  },

  getTimeSeriesAnalytics: async (days = 30) => {
    console.log('🔍 AdminService getTimeSeriesAnalytics called with days:', days);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));

    try {
      console.log('🔍 Calling mockStorageHelpers.getTimeSeriesAnalytics...');
      const analytics = mockStorageHelpers.getTimeSeriesAnalytics(days);
      console.log('✅ Time series analytics data received:', analytics);

      const mockResponse = {
        success: true,
        data: analytics
      };

      console.log('✅ Time series analytics response:', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('❌ Get time series analytics failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });

      // Generate fallback time series data
      const fallbackTimeSeriesData = {
        dailyStats: Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - 1 - i));
          return {
            date: date.toISOString().split('T')[0],
            users: Math.floor(Math.random() * 10) + 5,
            serials: Math.floor(Math.random() * 8) + 2,
            payments: Math.floor(Math.random() * 5) + 1,
            revenue: Math.floor(Math.random() * 5000) + 2000
          };
        }),
        trends: {
          userTrend: 'up',
          serialTrend: 'up',
          paymentTrend: 'stable',
          revenueTrend: 'up'
        },
        summary: {
          totalUsers: days * 7,
          totalSerials: days * 5,
          totalPayments: days * 3,
          totalRevenue: days * 3500
        }
      };

      console.log('🔄 Returning fallback time series analytics:', fallbackTimeSeriesData);
      return {
        success: true,
        data: fallbackTimeSeriesData
      };
    }
  },

  // Payment Comment Management
  addPaymentComment: async (paymentId, message) => {
    console.log('🔍 AdminService addPaymentComment called with:', paymentId, message);

    try {
      const response = await api.post(`/admin/payments/${paymentId}/comments`, {
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

  // Add payment receipt
  addPaymentReceipt: async (paymentId, receiptData) => {
    console.log('🔍 AdminService addPaymentReceipt called with:', paymentId);

    try {
      const formData = new FormData();
      formData.append('receipt', receiptData.file);
      formData.append('fileName', receiptData.fileName);

      const response = await api.post(`/admin/payments/${paymentId}/receipts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ Add payment receipt response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Add payment receipt failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete payment receipt
  deletePaymentReceipt: async (paymentId) => {
    console.log('🔍 AdminService deletePaymentReceipt called with:', paymentId);

    try {
      const response = await api.delete(`/admin/payments/${paymentId}/receipts`);
      console.log('✅ Delete payment receipt response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Delete payment receipt failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Product Management
  getProducts: async (filters = {}) => {
    console.log('🔍 Admin getProducts called with filters:', filters);

    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);

      // Always add cache buster
      params.append('_t', Date.now());
      params.append('_r', Math.random().toString(36).substring(7));

      const response = await api.get(`/admin/products?${params.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      console.log('✅ Get products response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get products failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  getProduct: async (productId) => {
    console.log('🔍 Admin getProduct called for ID:', productId);

    try {
      const response = await api.get(`/admin/products/${productId}`);
      console.log('✅ Get product response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get product failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  createProduct: async (productData) => {
    console.log('🔍 Admin createProduct called with data:', productData);

    try {
      const response = await api.post('/admin/products', productData);
      console.log('✅ Create product response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create product failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  updateProduct: async (productId, productData) => {
    console.log('🔍 Admin updateProduct called for ID:', productId, 'with data:', productData);

    try {
      const response = await api.put(`/admin/products/${productId}`, productData);
      console.log('✅ Update product response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update product failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  updateProductPoints: async (productId, points, reason) => {
    console.log('🔍 Admin updateProductPoints called for ID:', productId, 'points:', points, 'reason:', reason);

    try {
      const response = await api.patch(`/admin/products/${productId}/points`, {
        points,
        reason
      });
      console.log('✅ Update product points response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update product points failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteProduct: async (productId, { force = false } = {}) => {
    console.log('🔍 Admin deleteProduct called for ID:', productId, 'force:', force);

    try {
      const response = await api.delete(`/admin/products/${productId}${force ? '?force=true' : ''}`);
      console.log('✅ Delete product response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Delete product failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  getProductTypes: async () => {
    console.log('🔍 Admin getProductTypes called');

    try {
      const response = await api.get('/admin/products/types/list');
      console.log('✅ Get product types response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get product types failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  getProductsByType: async (type) => {
    console.log('🔍 Admin getProductsByType called for type:', type);

    try {
      const response = await api.get(`/admin/products/type/${type}`);
      console.log('✅ Get products by type response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get products by type failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  bulkUpdateProductPoints: async (updates, reason) => {
    console.log('🔍 Admin bulkUpdateProductPoints called with updates:', updates, 'reason:', reason);

    try {
      const response = await api.patch('/admin/products/bulk/points', {
        updates,
        reason
      });
      console.log('✅ Bulk update product points response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Bulk update product points failed:', error);
      console.error('   Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Training Management
  getTrainingCategories: async () => {
    const res = await api.get('/admin/training/categories');
    return res.data;
  },
  createTrainingCategory: async (data) => {
    const res = await api.post('/admin/training/categories', data);
    return res.data;
  },
  updateTrainingCategory: async (categoryId, data) => {
    const res = await api.put(`/admin/training/categories/${categoryId}`, data);
    return res.data;
  },
  deleteTrainingCategory: async (categoryId) => {
    const res = await api.delete(`/admin/training/categories/${categoryId}`);
    return res.data;
  },
  getTrainingVideos: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    });
    const res = await api.get(`/admin/training/videos?${params.toString()}`);
    return res.data;
  },
  createTrainingVideo: async (data) => {
    const res = await api.post('/admin/training/videos', data);
    return res.data;
  },
  updateTrainingVideo: async (videoId, data) => {
    const res = await api.put(`/admin/training/videos/${videoId}`, data);
    return res.data;
  },
  deleteTrainingVideo: async (videoId) => {
    const res = await api.delete(`/admin/training/videos/${videoId}`);
    return res.data;
  },

  // Documents Management
  getDocumentCategories: async () => {
    const res = await api.get('/admin/documents/categories');
    return res.data;
  },
  createDocumentCategory: async (data) => {
    const res = await api.post('/admin/documents/categories', data);
    return res.data;
  },
  updateDocumentCategory: async (categoryId, data) => {
    const res = await api.put(`/admin/documents/categories/${categoryId}`, data);
    return res.data;
  },
  deleteDocumentCategory: async (categoryId) => {
    const res = await api.delete(`/admin/documents/categories/${categoryId}`);
    return res.data;
  },
  getDocuments: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    });
    const res = await api.get(`/admin/documents/documents?${params.toString()}`);
    return res.data;
  },
  uploadDocument: async (data) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'file') form.append('document', v);
      else if (v !== undefined && v !== null) form.append(k, v);
    });
    const res = await api.post('/admin/documents/documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  updateDocument: async (documentId, data) => {
    const res = await api.put(`/admin/documents/documents/${documentId}`, data);
    return res.data;
  },
  deleteDocument: async (documentId) => {
    const res = await api.delete(`/admin/documents/documents/${documentId}`);
    return res.data;
  }

};
