import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  PlayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ClockIcon,
  StarIcon,
  FireIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Training = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sortBy: 'newest'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchFeaturedVideos();
    fetchVideos();
  }, [filters, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/training/categories', {
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

  const fetchFeaturedVideos = async () => {
    try {
      const response = await fetch('/api/training/featured?limit=6', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFeaturedVideos(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching featured videos:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      let url = '';
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { categoryId: filters.category })
      });

      // Handle different sort options
      switch (filters.sortBy) {
        case 'newest':
          params.append('sortBy', 'createdAt');
          params.append('sortOrder', 'desc');
          break;
        case 'oldest':
          params.append('sortBy', 'createdAt');
          params.append('sortOrder', 'asc');
          break;
        case 'popular':
          params.append('sortBy', 'viewCount');
          params.append('sortOrder', 'desc');
          break;
        default:
          params.append('sortBy', 'createdAt');
          params.append('sortOrder', 'desc');
      }

      // Use the main videos endpoint with filters
      url = `/api/training/videos?${params}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.data || []);
      
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total || 0,
          pages: data.pagination.pages || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error.message);
      toast.error('Failed to load training videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = async (video) => {
    try {
      // Increment view count
      await fetch(`/api/training/videos/${video._id}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Open video in modal
      setSelectedVideo(video);
      setShowVideoModal(true);
    } catch (error) {
      console.error('Error updating view count:', error);
      // Still open the video even if view count update fails
      setSelectedVideo(video);
      setShowVideoModal(true);
    }
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
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
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading && videos.length === 0) {
    return (
      <Layout title="Training">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout title="Training">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Training Videos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Learn from our comprehensive training library. Watch installation guides, 
            product tutorials, and best practices to enhance your skills.
          </p>
        </div>

        {/* Featured Videos Section */}
        {featuredVideos.length > 0 && !filters.category && !filters.search && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <StarIcon className="h-5 w-5 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Featured Videos
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredVideos.slice(0, 3).map((video) => (
                <div
                  key={video._id}
                  onClick={() => handleVideoClick(video)}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
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
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <PlayIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                      <PlayIcon className="h-12 w-12 text-white opacity-0 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatViewCount(video.viewCount)} views
                      </span>
                      {video.duration && (
                        <span className="text-xs text-gray-500">
                          {video.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Videos
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by title, description..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
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
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        {error && videos.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
        ) : videos.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No videos found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {Object.values(filters).some(f => f)
                ? 'Try adjusting your filters or search terms.'
                : 'No training videos are available at the moment.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div
                  key={video._id}
                  onClick={() => handleVideoClick(video)}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                >
                  {/* Large Video Thumbnail */}
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <PlayIcon className="h-12 w-12 text-gray-400" />
                        <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-black bg-opacity-50 px-2 py-1 rounded">
                          {video.platform}
                        </div>
                      </div>
                    )}

                    {/* Fallback thumbnail display */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700" style={{ display: 'none' }}>
                      <PlayIcon className="h-12 w-12 text-gray-400" />
                      <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-black bg-opacity-50 px-2 py-1 rounded">
                        {video.platform}
                      </div>
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <div className="transform scale-0 group-hover:scale-100 transition-transform duration-200">
                        <div className="bg-white bg-opacity-90 rounded-full p-3">
                          <PlayIcon className="h-8 w-8 text-orange-600" />
                        </div>
                      </div>
                    </div>

                    {/* Platform Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-70 text-white">
                        {getPlatformIcon(video.platform)} {video.platform}
                      </span>
                    </div>

                    {/* Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-70 text-white">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {video.duration}
                        </span>
                      </div>
                    )}

                    {/* Featured Badge */}
                    {video.isFeatured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-orange-500 text-white">
                          <StarIcon className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                      {video.title}
                    </h3>

                    {video.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                        {video.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {video.categoryId && (
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: video.categoryId.color + '20', color: video.categoryId.color }}
                          >
                            {video.categoryId.name}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(video.difficulty)}`}>
                          {video.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{formatViewCount(video.viewCount)} views</span>
                      </div>
                      {video.language && (
                        <span className="capitalize">{video.language}</span>
                      )}
                    </div>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {video.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          >
                            #{tag}
                          </span>
                        ))}
                        {video.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{video.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} videos
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

export default Training;
