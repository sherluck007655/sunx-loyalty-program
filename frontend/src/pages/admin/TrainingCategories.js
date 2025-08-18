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
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const TrainingCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, category: null });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'fas fa-play-circle',
    color: '#ff831f',
    sortOrder: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/training/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message);
      toast.error('Failed to load training categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingCategory 
        ? `/api/admin/training/categories/${editingCategory._id}`
        : '/api/admin/training/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save category');
      }

      const data = await response.json();
      
      if (editingCategory) {
        setCategories(categories.map(cat => 
          cat._id === editingCategory._id ? data.data : cat
        ));
        toast.success('Category updated successfully');
      } else {
        setCategories([...categories, data.data]);
        toast.success('Category created successfully');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      color: category.color,
      sortOrder: category.sortOrder
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/training/categories/${deleteModal.category._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }

      setCategories(categories.filter(cat => cat._id !== deleteModal.category._id));
      toast.success('Category deleted successfully');
      setDeleteModal({ show: false, category: null });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.message);
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      const response = await fetch(`/api/admin/training/categories/${category._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...category,
          isActive: !category.isActive
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update category status');
      }

      const data = await response.json();
      setCategories(categories.map(cat => 
        cat._id === category._id ? data.data : cat
      ));
      
      toast.success(`Category ${data.data.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error(error.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: 'fas fa-play-circle',
      color: '#ff831f',
      sortOrder: 0
    });
  };

  const iconOptions = [
    { value: 'fas fa-play-circle', label: 'Play Circle' },
    { value: 'fas fa-video', label: 'Video' },
    { value: 'fas fa-graduation-cap', label: 'Graduation Cap' },
    { value: 'fas fa-book', label: 'Book' },
    { value: 'fas fa-tools', label: 'Tools' },
    { value: 'fas fa-lightbulb', label: 'Light Bulb' },
    { value: 'fas fa-cog', label: 'Settings' },
    { value: 'fas fa-star', label: 'Star' }
  ];

  if (loading) {
    return (
      <Layout title="Training Categories">
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Training Categories">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Categories</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchCategories} className="bg-orange-500 hover:bg-orange-600">
            Try Again
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Training Categories">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Training Categories</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage training video categories ({categories.length} total)
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No categories</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first training category.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => setShowModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category._id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <i 
                        className={`${category.icon} text-lg`}
                        style={{ color: category.color }}
                      ></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category.videoCount} videos
                      </p>
                    </div>
                  </div>
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {category.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="text-gray-600 hover:text-orange-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(category)}
                      className={`${category.isActive ? 'text-gray-600 hover:text-red-600' : 'text-gray-600 hover:text-green-600'}`}
                    >
                      {category.isActive ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteModal({ show: true, category })}
                      className="text-gray-600 hover:text-red-600"
                      disabled={category.videoCount > 0}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-xs text-gray-500">
                    Order: {category.sortOrder}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter category name"
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
                    placeholder="Enter category description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Icon
                    </label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    >
                      {iconOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
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
                    {editingCategory ? 'Update' : 'Create'} Category
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
        onClose={() => setDeleteModal({ show: false, category: null })}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteModal.category?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </Layout>
  );
};

export default TrainingCategories;
