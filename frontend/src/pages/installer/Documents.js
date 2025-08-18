import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  FolderIcon,
  ClockIcon,
  FireIcon,
  DocumentTextIcon as FileTextIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { documentService } from '../../services/documentService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularDocs, setPopularDocs] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const { isAuthenticated, userType, token } = useAuth();
  const navigate = useNavigate();

  const loadDocuments = useCallback(async () => {
    if (activeTab !== 'all') return;

    try {
      setLoading(true);
      setError(null);
      console.log('Loading documents with auth check...');

      if (!token) {
        setError('Authentication required');
        toast.error('Please log in again');
        navigate('/login');
        return;
      }

      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedCategory && selectedCategory !== 'all') filters.categoryId = selectedCategory;

      console.log('Calling documentService.getDocuments with filters:', filters);
      const response = await documentService.getDocuments(currentPage, 12, filters);
      console.log('Documents response:', response);

      if (response.success) {
        setDocuments(response.data.documents || []);
        setPagination(response.data.pagination || {});
        console.log('Documents loaded successfully:', response.data.documents?.length || 0);
      } else {
        setError('Failed to load documents');
        console.error('Documents API returned error:', response);
      }
    } catch (err) {
      console.error('Error loading documents:', err);

      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      setError('Failed to load documents');
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, searchTerm, selectedCategory, token, navigate]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await documentService.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const loadPopularDocs = useCallback(async () => {
    try {
      const response = await documentService.getPopularDocuments(6);
      if (response.success) {
        setPopularDocs(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching popular documents:', error);
    }
  }, []);

  const loadRecentDocs = useCallback(async () => {
    try {
      const response = await documentService.getRecentDocuments(6);
      if (response.success) {
        setRecentDocs(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching recent documents:', error);
    }
  }, []);

  useEffect(() => {
    console.log('Documents useEffect - Auth state:', { isAuthenticated, userType, hasToken: !!token });

    // Only proceed if we have authentication data
    if (isAuthenticated === undefined || userType === undefined) {
      console.log('Authentication state not yet loaded, waiting...');
      return;
    }

    // Check if user is authenticated as installer
    if (!isAuthenticated || userType !== 'installer') {
      console.log('Not authenticated as installer:', { isAuthenticated, userType });
      toast.error('Please log in as installer to access documents');
      navigate('/login');
      return;
    }

    if (!token) {
      console.log('No token found');
      toast.error('Please log in again');
      navigate('/login');
      return;
    }

    console.log('Loading installer documents...');
    loadCategories();
    loadPopularDocs();
    loadRecentDocs();
  }, [loadCategories, loadPopularDocs, loadRecentDocs, isAuthenticated, userType, token, navigate]);

  useEffect(() => {
    console.log('Documents loadDocuments useEffect - Auth state:', { isAuthenticated, userType, hasToken: !!token });

    if (isAuthenticated && userType === 'installer' && token) {
      console.log('All conditions met, loading documents...');
      loadDocuments();
    } else {
      console.log('Conditions not met for loading documents');
    }
  }, [loadDocuments, isAuthenticated, userType, token]);

  const handleDownload = async (documentId, fileName) => {
    try {
      await documentService.downloadDocument(documentId, fileName);
      toast.success('Download started');

      // Refresh data to update download counts
      if (activeTab === 'popular') loadPopularDocs();
      if (activeTab === 'recent') loadRecentDocs();
      if (activeTab === 'all') loadDocuments();
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('csv')) return '📊';
    if (fileType.includes('powerpoint')) return '📽️';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('zip')) return '📦';
    return '📄';
  };

  const renderDocumentRow = (document) => (
    <div key={document._id} className="border-b border-gray-100 last:border-b-0 hover:bg-orange-25 transition-colors">
      {/* Mobile Layout */}
      <div className="md:hidden p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileTextIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm truncate">{document.title}</h3>
              <p className="text-xs text-gray-500">{document.categoryId?.name}</p>
              {document.isFeatured && (
                <StarIconSolid className="h-3 w-3 text-orange-500 inline ml-1" />
              )}
            </div>
          </div>
        </div>

        {document.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{document.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{formatFileSize(document.fileSize)}</span>
          <span className="flex items-center">
            <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
            {document.downloadCount}
          </span>
        </div>

        <Button
          onClick={() => handleDownload(document._id, document.originalFileName)}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          size="sm"
        >
          <ArrowDownTrayIcon className="mr-2 h-3 w-3" />
          Download
        </Button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 items-center">
        <div className="col-span-5 flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileTextIcon className="h-4 w-4 text-orange-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center">
              <h3 className="font-medium text-gray-900 text-sm truncate">{document.title}</h3>
              {document.isFeatured && (
                <StarIconSolid className="h-3 w-3 text-orange-500 ml-1" />
              )}
            </div>
            {document.description && (
              <p className="text-xs text-gray-500 truncate">{document.description}</p>
            )}
          </div>
        </div>
        <div className="col-span-2 text-sm text-gray-600">{document.categoryId?.name}</div>
        <div className="col-span-2 text-sm text-gray-600">{formatFileSize(document.fileSize)}</div>
        <div className="col-span-2 text-sm text-gray-600 flex items-center">
          <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
          {document.downloadCount}
        </div>
        <div className="col-span-1">
          <Button
            onClick={() => handleDownload(document._id, document.originalFileName)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            size="sm"
          >
            <ArrowDownTrayIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  const getCurrentDocuments = () => {
    switch (activeTab) {
      case 'popular':
        return popularDocs;
      case 'recent':
        return recentDocs;
      default:
        return documents;
    }
  };

  console.log('Documents render - State:', {
    loading,
    error,
    isAuthenticated,
    userType,
    hasToken: !!token,
    documentsCount: documents.length,
    categoriesCount: categories.length
  });

  if (loading) {
    console.log('Rendering loading spinner');
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Try Again
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Center</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and download technical documents, manuals, and resources
        </p>
      </div>

      {/* Category Quick Access */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.slice(0, 6).map((category) => (
          <Card
            key={category._id}
            className="cursor-pointer hover:shadow-md transition-shadow border-orange-200"
            onClick={() => {
              setSelectedCategory(category._id);
              setActiveTab('all');
            }}
          >
            <CardContent className="p-3 text-center">
              <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center bg-orange-100">
                <FolderIcon className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-medium text-xs text-gray-900">{category.name}</h3>
              <p className="text-xs text-gray-500">{category.documentCount} docs</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-orange-50 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-100'
          }`}
        >
          <DocumentIcon className="h-4 w-4 inline mr-2" />
          All Documents
        </button>
        <button
          onClick={() => setActiveTab('popular')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'popular'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-100'
          }`}
        >
          <FireIcon className="h-4 w-4 inline mr-2" />
          Popular
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'recent'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-100'
          }`}
        >
          <ClockIcon className="h-4 w-4 inline mr-2" />
          Recent
        </button>
      </div>

      {/* Filters - Only show for 'all' tab */}
      {activeTab === 'all' && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest</SelectItem>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                  <SelectItem value="name">A to Z</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSortBy('createdAt');
                  setSortOrder('desc');
                }}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List - Mobile Responsive */}
      <div className="bg-white rounded-lg border border-orange-200 overflow-hidden">
        {getCurrentDocuments().length === 0 ? (
          <div className="p-8 text-center">
            <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No documents found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-orange-50 border-b border-orange-200 font-medium text-gray-700">
              <div className="col-span-5">Document</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Downloads</div>
              <div className="col-span-1">Action</div>
            </div>

            {/* Document Rows */}
            {getCurrentDocuments().map(renderDocumentRow)}
          </>
        )}
      </div>

      {/* Pagination - Only show for 'all' tab */}
      {activeTab === 'all' && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, pagination.total)} of {pagination.total} documents
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
              disabled={currentPage === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default Documents;
