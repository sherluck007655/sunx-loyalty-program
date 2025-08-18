import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { DocumentIcon } from '@heroicons/react/24/outline';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, userType, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated as admin
    if (!isAuthenticated || userType !== 'admin') {
      toast.error('Please log in as admin to access documents');
      navigate('/admin/login');
      return;
    }

    fetchDocuments();
  }, [isAuthenticated, userType, navigate]);

  const fetchDocuments = async () => {
    try {
      console.log('Fetching documents...');
      const authToken = localStorage.getItem('token'); // Get token from localStorage
      console.log('Auth status:', { isAuthenticated, userType, hasToken: !!authToken });

      if (!authToken) {
        setError('No authentication token found');
        toast.error('Please log in again');
        navigate('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/documents/documents', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Documents data:', data);
        setDocuments(data.data?.documents || []);
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch documents:', errorData);

        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          navigate('/admin/login');
          return;
        }

        setError(`Failed to fetch documents: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const token = localStorage.getItem('token'); // Use 'token' instead of 'adminToken'
      const response = await fetch(`/api/admin/documents/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Refresh documents list to update download count
        fetchDocuments();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to download document');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  if (loading) {
    return (
      <Layout title="Documents">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-2">Loading documents...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Documents">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage uploaded documents</p>
            </div>
            <Button
              onClick={() => window.location.href = '/admin/documents/upload'}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Upload Document
            </Button>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <DocumentIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-500 mb-4">Error loading documents: {error}</p>
              <Button onClick={fetchDocuments} className="bg-orange-500 hover:bg-orange-600 text-white">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Documents">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage uploaded documents ({documents.length} found)
            </p>
          </div>
          <Button
            onClick={() => window.location.href = '/admin/documents/upload'}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Upload Document
          </Button>
        </div>

        {/* Documents List - Mobile Responsive */}
        <div className="bg-white rounded-lg border border-orange-200 overflow-hidden">
          {documents.length === 0 ? (
            <div className="p-8 text-center">
              <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No documents found</p>
              <p className="text-sm text-gray-400 mt-2">Upload some documents to get started</p>
            </div>
          ) : (
            <>
              {/* Desktop Table Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-orange-50 border-b border-orange-200 font-medium text-gray-700">
                <div className="col-span-5">Document</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Version</div>
                <div className="col-span-2">Downloads</div>
                <div className="col-span-1">Action</div>
              </div>

              {/* Document Rows */}
              {documents.map((document) => (
                <div key={document._id} className="border-b border-gray-100 last:border-b-0 hover:bg-orange-25 transition-colors">
                  {/* Mobile Layout */}
                  <div className="md:hidden p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <DocumentIcon className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{document.title}</h3>
                          <p className="text-xs text-gray-500 truncate">{document.description || 'No description'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                      <span>Size: {formatFileSize(document.fileSize)}</span>
                      <span>Version: {document.version || '1.0'}</span>
                      <span>Downloads: {document.downloadCount || 0}</span>
                      <span>Date: {new Date(document.createdAt).toLocaleDateString()}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document._id, document.originalFileName)}
                      className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      Download
                    </Button>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 items-center">
                    <div className="col-span-5 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <DocumentIcon className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">{document.title}</h3>
                        <p className="text-xs text-gray-500 truncate">{document.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-gray-600">{formatFileSize(document.fileSize)}</div>
                    <div className="col-span-2 text-sm text-gray-600">v{document.version || '1.0'}</div>
                    <div className="col-span-2 text-sm text-gray-600">{document.downloadCount || 0}</div>
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document._id, document.originalFileName)}
                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Documents;
