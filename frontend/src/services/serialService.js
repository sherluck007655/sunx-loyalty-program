import api from './api';

export const serialService = {
  // Add a new serial number
  addSerial: async (serialData) => {
    console.log('🔍 Serial addSerial called with:', serialData);
    console.log('🔍 Using real backend API');

    try {
      const response = await api.post('/serial/add', serialData);

      console.log('✅ Serial number added:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Serial add failed:', error);
      throw error;
    }
  },

  // Get all serial numbers for the installer
  getSerials: async (page = 1, limit = 10, search = '') => {
    console.log('🔍 Serial getSerials called with:', { page, limit, search });
    console.log('🔍 Using real backend API');

    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);

      const response = await api.get(`/serial/installer?${params}`);

      console.log('✅ Serial numbers loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Serial loading failed:', error);
      throw error;
    }
  },

  // Get a specific serial number
  getSerial: async (serialId) => {
    console.log('🔍 Serial getSerial called with:', serialId);
    console.log('🔍 Using real backend API');

    try {
      const response = await api.get(`/serial/${serialId}`);

      console.log('✅ Serial number loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Serial loading failed:', error);
      throw error;
    }
  },

  // Update a serial number
  updateSerial: async (serialId, updateData) => {
    console.log('🔍 Serial updateSerial called with:', { serialId, updateData });
    console.log('🔍 Using real backend API');

    try {
      const response = await api.put(`/serial/${serialId}`, updateData);

      console.log('✅ Serial number updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Serial update failed:', error);
      throw error;
    }
  },

  // Delete a serial number
  deleteSerial: async (serialId) => {
    console.log('🔍 Serial deleteSerial called with:', serialId);
    console.log('🔍 Using real backend API');

    try {
      const response = await api.delete(`/serial/${serialId}`);

      console.log('✅ Serial number deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Serial deletion failed:', error);
      throw error;
    }
  },

  // Check if serial number exists
  checkSerial: async (serialNumber) => {
    console.log('🔍 Serial checkSerial called with:', serialNumber);
    console.log('🔍 Using real backend API');

    try {
      const response = await api.get(`/serial/check/${serialNumber}`);

      console.log('✅ Serial check result:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Serial check failed:', error);
      throw error;
    }
  },

  // Get installer's serial statistics
  getSerialStats: async () => {
    console.log('🔍 Serial getSerialStats called');
    console.log('🔍 Using real backend API');

    try {
      const response = await api.get('/serial/stats');

      console.log('✅ Serial stats loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Serial stats failed:', error);
      throw error;
    }
  },

  // Check if serial number is valid (real-time validation)
  checkSerialValidity: async (serialNumber) => {
    console.log('🔍 SerialService checkSerialValidity called with:', serialNumber);
    console.log('🔍 Using real backend API');

    try {
      const response = await api.get(`/serial/validate/${serialNumber}`);

      console.log('✅ Serial validity check response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Serial validity check failed:', error);
      throw error;
    }
  }
};
