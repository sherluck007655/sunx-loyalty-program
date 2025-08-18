import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModal';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const TrainingVideos = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, video: null });
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    difficulty: '',
    platform: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    videoUrl: '',
    duration: '',
    difficulty: 'beginner',
    language: 'english',
    tags: [],
    isFeatured: false
  });

  useEffect(() => {
    fetchCategories();
    fetchVideos();
  }, [filters, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/training/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.platform && { platform: filters.platform })
      });

      const response = await fetch(`/api/admin/training/videos?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.data || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0
      }));
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error.message);
      toast.error('Failed to load training videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingVideo 
        ? `/api/admin/training/videos/${editingVideo._id}`
        : '/api/admin/training/videos';
      
      const method = editingVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          tags: JSON.stringify(formData.tags)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save video');
      }

      const data = await response.json();
      
      if (editingVideo) {
        setVideos(videos.map(video => 
          video._id === editingVideo._id ? data.data : video
        ));
        toast.success('Video updated successfully');
      } else {
        fetchVideos(); // Refresh the list
        toast.success('Video created successfully');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error(error.message);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      categoryId: video.categoryId._id,
      videoUrl: video.videoUrl,
      duration: video.duration || '',
      difficulty: video.difficulty,
      language: video.language,
      tags: video.tags || [],
      isFeatured: video.isFeatured
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/training/videos/${deleteModal.video._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete video');
      }

      setVideos(videos.filter(video => video._id !== deleteModal.video._id));
      toast.success('Video deleted successfully');
      setDeleteModal({ show: false, video: null });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error(error.message);
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const getEmbedUrl = (video) => {
    if (!video) return '';

    // Use embedUrl if available, otherwise construct based on platform
    if (video.embedUrl) {
      return video.embedUrl;
    }

    // Fallback construction for different platforms
    if (video.platform === 'youtube' && video.videoId) {
      return `https://www.youtube.com/embed/${video.videoId}`;
    } else if (video.platform === 'vimeo' && video.videoId) {
      return `https://player.vimeo.com/video/${video.videoId}`;
    }

    // For other platforms, return the original URL
    return video.videoUrl;
  };

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showVideoModal) {
        closeVideoModal();
      }
    };

    if (showVideoModal) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showVideoModal]);

  const handleToggleStatus = async (video) => {
    try {
      const response = await fetch(`/api/admin/training/videos/${video._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isActive: !video.isActive
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update video status');
      }

      const data = await response.json();
      setVideos(videos.map(v => 
        v._id === video._id ? data.data : v
      ));
      
      toast.success(`Video ${data.data.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating video status:', error);
      toast.error(error.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      categoryId: '',
      videoUrl: '',
      duration: '',
      difficulty: 'beginner',
      language: 'english',
      tags: [],
      isFeatured: false
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube':
        return '🎥';
      case 'vimeo':
        return '📹';
      case 'facebook':
        return '📘';
      default:
        return '🎬';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && videos.length === 0) {
    return (
      <Layout title="Training Videos">
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error && videos.length === 0) {
    return (
      <Layout title="Training Videos">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Videos</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchVideos} className="bg-orange-500 hover:bg-orange-600">
            Try Again
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Training Videos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Training Videos</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage training videos ({pagination.total} total)
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Video
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search videos..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Platform
              </label>
              <select
                value={filters.platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Platforms</option>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="facebook">Facebook</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No videos found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {Object.values(filters).some(f => f) 
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by adding your first training video.'
              }
            </p>
            {!Object.values(filters).some(f => f) && (
              <div className="mt-6">
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <PlayIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}

                    {/* Fallback thumbnail display */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700" style={{ display: 'none' }}>
                      <PlayIcon className="h-12 w-12 text-gray-400" />
                    </div>

                    {/* Play button overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all cursor-pointer"
                      onClick={() => handleVideoClick(video)}
                    >
                      <div className="bg-white bg-opacity-90 rounded-full p-3 opacity-0 hover:opacity-100 transition-opacity">
                        <PlayIcon className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                    
                    {/* Platform Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
                        {getPlatformIcon(video.platform)} {video.platform}
                      </span>
                    </div>

                    {/* Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
                          {video.duration}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">
                        {video.title}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2">
                        {video.isFeatured && (
                          <Badge variant="default" className="bg-orange-100 text-orange-800">
                            Featured
                          </Badge>
                        )}
                        <Badge variant={video.isActive ? "default" : "secondary"}>
                          {video.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: video.categoryId?.color + '20', color: video.categoryId?.color }}
                      >
                        {video.categoryId?.name}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(video.difficulty)}`}>
                        {video.difficulty}
                      </span>
                    </div>

                    {video.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {video.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(video)}
                          className="text-gray-600 hover:text-orange-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(video)}
                          className={`${video.isActive ? 'text-gray-600 hover:text-red-600' : 'text-gray-600 hover:text-green-600'}`}
                        >
                          {video.isActive ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteModal({ show: true, video })}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="text-xs text-gray-500">
                        {video.viewCount} views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingVideo ? 'Edit Video' : 'Add New Video'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter video title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter video description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a category</option>
                    {categories.filter(cat => cat.isActive).map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Video URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported: YouTube, Vimeo, Facebook videos
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 10:30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Language
                  </label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., English, Urdu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleTagInput}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Type a tag and press Enter"
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-orange-600 hover:text-orange-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Featured Video
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {editingVideo ? 'Update' : 'Create'} Video
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, video: null })}
        onConfirm={handleDelete}
        title="Delete Video"
        message={`Are you sure you want to delete "${deleteModal.video?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl mx-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedVideo.title}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {selectedVideo.category?.name || 'Uncategorized'}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {selectedVideo.viewCount || 0} views
                  </div>
                  {selectedVideo.duration && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {selectedVideo.duration}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={closeVideoModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              {selectedVideo.platform === 'youtube' || selectedVideo.platform === 'vimeo' ? (
                <iframe
                  src={getEmbedUrl(selectedVideo)}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <PlayIcon className="h-16 w-16 text-white mx-auto mb-4" />
                    <p className="text-white mb-4">This video cannot be embedded</p>
                    <Button
                      onClick={() => window.open(selectedVideo.videoUrl, '_blank')}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Description */}
            {selectedVideo.description && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {selectedVideo.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TrainingVideos;
