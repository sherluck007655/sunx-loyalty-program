import { adminService } from '../adminService';
import api from '../api';

// Mock the api module
jest.mock('../api');

describe('adminService - Training Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Training Categories', () => {
    test('getTrainingCategories should call GET /admin/training/categories', async () => {
      const mockResponse = { data: { categories: [{ _id: '1', name: 'Test Category' }] } };
      api.get.mockResolvedValue(mockResponse);

      const result = await adminService.getTrainingCategories();

      expect(api.get).toHaveBeenCalledWith('/admin/training/categories');
      expect(result).toEqual(mockResponse);
    });

    test('createTrainingCategory should call POST with category data', async () => {
      const categoryData = { name: 'New Category', description: 'Test description' };
      const mockResponse = { data: { category: { _id: '1', ...categoryData } } };
      api.post.mockResolvedValue(mockResponse);

      const result = await adminService.createTrainingCategory(categoryData);

      expect(api.post).toHaveBeenCalledWith('/admin/training/categories', categoryData);
      expect(result).toEqual(mockResponse);
    });

    test('updateTrainingCategory should call PUT with category data', async () => {
      const categoryId = '123';
      const updateData = { name: 'Updated Category' };
      const mockResponse = { data: { category: { _id: categoryId, ...updateData } } };
      api.put.mockResolvedValue(mockResponse);

      const result = await adminService.updateTrainingCategory(categoryId, updateData);

      expect(api.put).toHaveBeenCalledWith(`/admin/training/categories/${categoryId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    test('deleteTrainingCategory should call DELETE with category ID', async () => {
      const categoryId = '123';
      const mockResponse = { data: { message: 'Category deleted' } };
      api.delete.mockResolvedValue(mockResponse);

      const result = await adminService.deleteTrainingCategory(categoryId);

      expect(api.delete).toHaveBeenCalledWith(`/admin/training/categories/${categoryId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Training Videos', () => {
    test('getTrainingVideos should call GET with query parameters', async () => {
      const filters = { page: 1, limit: 10, search: 'test', difficulty: 'beginner' };
      const mockResponse = { data: { videos: [], pagination: { page: 1, pages: 1, total: 0 } } };
      api.get.mockResolvedValue(mockResponse);

      const result = await adminService.getTrainingVideos(filters);

      expect(api.get).toHaveBeenCalledWith('/admin/training/videos?page=1&limit=10&search=test&difficulty=beginner');
      expect(result).toEqual(mockResponse);
    });

    test('getTrainingVideos should handle empty filters', async () => {
      const mockResponse = { data: { videos: [] } };
      api.get.mockResolvedValue(mockResponse);

      await adminService.getTrainingVideos({});

      expect(api.get).toHaveBeenCalledWith('/admin/training/videos?');
    });

    test('createTrainingVideo should call POST with video data', async () => {
      const videoData = { title: 'Test Video', videoUrl: 'https://youtube.com/watch?v=123' };
      const mockResponse = { data: { video: { _id: '1', ...videoData } } };
      api.post.mockResolvedValue(mockResponse);

      const result = await adminService.createTrainingVideo(videoData);

      expect(api.post).toHaveBeenCalledWith('/admin/training/videos', videoData);
      expect(result).toEqual(mockResponse);
    });

    test('updateTrainingVideo should call PUT with video data', async () => {
      const videoId = '123';
      const updateData = { title: 'Updated Video' };
      const mockResponse = { data: { video: { _id: videoId, ...updateData } } };
      api.put.mockResolvedValue(mockResponse);

      const result = await adminService.updateTrainingVideo(videoId, updateData);

      expect(api.put).toHaveBeenCalledWith(`/admin/training/videos/${videoId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    test('deleteTrainingVideo should call DELETE with video ID', async () => {
      const videoId = '123';
      const mockResponse = { data: { message: 'Video deleted' } };
      api.delete.mockResolvedValue(mockResponse);

      const result = await adminService.deleteTrainingVideo(videoId);

      expect(api.delete).toHaveBeenCalledWith(`/admin/training/videos/${videoId}`);
      expect(result).toEqual(mockResponse);
    });
  });
});

describe('adminService - Document Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Document Categories', () => {
    test('getDocumentCategories should call GET /admin/documents/categories', async () => {
      const mockResponse = { data: { categories: [{ _id: '1', name: 'Test Category' }] } };
      api.get.mockResolvedValue(mockResponse);

      const result = await adminService.getDocumentCategories();

      expect(api.get).toHaveBeenCalledWith('/admin/documents/categories');
      expect(result).toEqual(mockResponse);
    });

    test('createDocumentCategory should call POST with category data', async () => {
      const categoryData = { name: 'New Category', description: 'Test description' };
      const mockResponse = { data: { category: { _id: '1', ...categoryData } } };
      api.post.mockResolvedValue(mockResponse);

      const result = await adminService.createDocumentCategory(categoryData);

      expect(api.post).toHaveBeenCalledWith('/admin/documents/categories', categoryData);
      expect(result).toEqual(mockResponse);
    });

    test('updateDocumentCategory should call PUT with category data', async () => {
      const categoryId = '123';
      const updateData = { name: 'Updated Category' };
      const mockResponse = { data: { category: { _id: categoryId, ...updateData } } };
      api.put.mockResolvedValue(mockResponse);

      const result = await adminService.updateDocumentCategory(categoryId, updateData);

      expect(api.put).toHaveBeenCalledWith(`/admin/documents/categories/${categoryId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    test('deleteDocumentCategory should call DELETE with category ID', async () => {
      const categoryId = '123';
      const mockResponse = { data: { message: 'Category deleted' } };
      api.delete.mockResolvedValue(mockResponse);

      const result = await adminService.deleteDocumentCategory(categoryId);

      expect(api.delete).toHaveBeenCalledWith(`/admin/documents/categories/${categoryId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Documents', () => {
    test('getDocuments should call GET with query parameters', async () => {
      const filters = { page: 1, limit: 10, search: 'test', documentType: 'manual' };
      const mockResponse = { data: { documents: [], pagination: { page: 1, pages: 1, total: 0 } } };
      api.get.mockResolvedValue(mockResponse);

      const result = await adminService.getDocuments(filters);

      expect(api.get).toHaveBeenCalledWith('/admin/documents/documents?page=1&limit=10&search=test&documentType=manual');
      expect(result).toEqual(mockResponse);
    });

    test('uploadDocument should call POST with FormData for file upload', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const docData = { title: 'Test Doc', file, categoryId: '123' };
      const mockResponse = { data: { document: { _id: '1', title: 'Test Doc' } } };
      api.post.mockResolvedValue(mockResponse);

      const result = await adminService.uploadDocument(docData);

      expect(api.post).toHaveBeenCalledWith(
        '/admin/documents/documents',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual(mockResponse);
    });

    test('uploadDocument should handle document without file', async () => {
      const docData = { title: 'Test Doc', categoryId: '123' };
      const mockResponse = { data: { document: { _id: '1', title: 'Test Doc' } } };
      api.post.mockResolvedValue(mockResponse);

      const result = await adminService.uploadDocument(docData);

      expect(api.post).toHaveBeenCalledWith(
        '/admin/documents/documents',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual(mockResponse);
    });

    test('updateDocument should call PUT with document data', async () => {
      const docId = '123';
      const updateData = { title: 'Updated Document' };
      const mockResponse = { data: { document: { _id: docId, ...updateData } } };
      api.put.mockResolvedValue(mockResponse);

      const result = await adminService.updateDocument(docId, updateData);

      expect(api.put).toHaveBeenCalledWith(`/admin/documents/documents/${docId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    test('deleteDocument should call DELETE with document ID', async () => {
      const docId = '123';
      const mockResponse = { data: { message: 'Document deleted' } };
      api.delete.mockResolvedValue(mockResponse);

      const result = await adminService.deleteDocument(docId);

      expect(api.delete).toHaveBeenCalledWith(`/admin/documents/documents/${docId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      const errorResponse = { response: { data: { message: 'Server error' } } };
      api.get.mockRejectedValue(errorResponse);

      await expect(adminService.getTrainingCategories()).rejects.toEqual(errorResponse);
    });

    test('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      api.get.mockRejectedValue(networkError);

      await expect(adminService.getDocumentCategories()).rejects.toEqual(networkError);
    });
  });
});
