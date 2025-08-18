import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const DocumentUpload = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    version: '1.0',
    tags: [],
    isFeatured: false
  });
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  const [tagInput, setTagInput] = useState('');
  const { isAuthenticated, userType, token } = useAuth();
  const navigate = useNavigate();

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/zip'
  ];

  const maxFileSize = 20 * 1024 * 1024; // 20MB

  useEffect(() => {
    // Check if user is authenticated as admin
    if (!isAuthenticated || userType !== 'admin') {
      toast.error('Please log in as admin to access document upload');
      navigate('/admin/login');
      return;
    }

    fetchCategories();
  }, [isAuthenticated, userType, navigate]);

  const fetchCategories = async () => {
    try {
      if (!token) {
        toast.error('Please log in again');
        navigate('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/documents/categories/active', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please select a supported file format.');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast.error('File size exceeds 20MB limit.');
      return;
    }

    setSelectedFile(file);
    
    // Auto-fill title from filename if empty
    if (!formData.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({ ...prev, title: nameWithoutExt }));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const createNewCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const response = await fetch('/api/admin/documents/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Category created successfully');
        setCategories(prev => [...prev, data.data]);
        setFormData(prev => ({ ...prev, categoryId: data.data._id }));
        setNewCategory({ name: '', description: '' });
        setShowNewCategory(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('document', selectedFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('categoryId', formData.categoryId);
      uploadFormData.append('version', formData.version);
      uploadFormData.append('tags', JSON.stringify(formData.tags));
      uploadFormData.append('isFeatured', formData.isFeatured);

      const response = await fetch('/api/admin/documents/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Document uploaded successfully');
        
        // Reset form
        setSelectedFile(null);
        setFormData({
          title: '',
          description: '',
          categoryId: '',
          version: '1.0',
          tags: [],
          isFeatured: false
        });
        
        // Reset file input
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
        
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout title="Upload Document">
      <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Document</h1>
        <p className="text-gray-600 dark:text-gray-400">Upload documents for installers to download</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Select File</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <DocumentIcon className="h-12 w-12 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedFile(null)}
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium">Drop your file here, or browse</p>
                    <p className="text-sm text-gray-500">
                      Supports: PDF, DOC, DOCX, XLS, XLSX, CSV, PPT, PPTX, JPG, PNG, WEBP, ZIP
                    </p>
                    <p className="text-sm text-gray-500">Maximum file size: 20MB</p>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.zip"
                    onChange={handleFileInputChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-input').click()}
                  >
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Document Details */}
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Document title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Document description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewCategory(true)}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Version</label>
                <Input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Featured Document
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <div className="flex space-x-2 mb-2">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={uploading || !selectedFile}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </form>

      {/* New Category Modal */}
      {showNewCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Category</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Category name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Category description"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewCategory(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={createNewCategory}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default DocumentUpload;
