import api from './api';

export const documentService = {
  // Get all documents with pagination and filters
  getDocuments: async (page = 1, limit = 20, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await api.get(`/documents?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  // Get document categories
  getCategories: async () => {
    try {
      const response = await api.get('/documents/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get popular documents
  getPopularDocuments: async (limit = 6) => {
    try {
      const response = await api.get(`/documents/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching popular documents:', error);
      throw error;
    }
  },

  // Get recent documents
  getRecentDocuments: async (limit = 6) => {
    try {
      const response = await api.get(`/documents/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent documents:', error);
      throw error;
    }
  },

  // Download document
  downloadDocument: async (documentId, fileName) => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }
};
