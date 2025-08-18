import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { adminService } from '../services/adminService';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const ProductModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    type: 'inverter',
    points: '',
    manufacturer: '',
    description: '',
    specifications: {
      capacity: '',
      voltage: '',
      power: '',
      efficiency: '',
      dimensions: '',
      weight: ''
    },
    serialPattern: {
      prefix: '',
      length: 12,
      format: 'ALPHANUMERIC'
    },
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        model: product.model || '',
        type: product.type || 'inverter',
        points: product.points || '',
        manufacturer: product.manufacturer || '',
        description: product.description || '',
        specifications: {
          capacity: product.specifications?.capacity || '',
          voltage: product.specifications?.voltage || '',
          power: product.specifications?.power || '',
          efficiency: product.specifications?.efficiency || '',
          dimensions: product.specifications?.dimensions || '',
          weight: product.specifications?.weight || ''
        },
        serialPattern: {
          prefix: product.serialPattern?.prefix || '',
          length: product.serialPattern?.length || 12,
          format: product.serialPattern?.format || 'ALPHANUMERIC'
        },
        isActive: product.isActive !== undefined ? product.isActive : true
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.model.trim()) newErrors.model = 'Product model is required';
    if (!formData.type) newErrors.type = 'Product type is required';
    if (!formData.points || formData.points < 1) newErrors.points = 'Points must be at least 1';
    if (formData.points > 10000) newErrors.points = 'Points cannot exceed 10000';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        points: parseInt(formData.points)
      };
      
      let response;
      if (product) {
        response = await adminService.updateProduct(product._id, submitData);
      } else {
        response = await adminService.createProduct(submitData);
      }
      
      if (response.success) {
        toast.success(product ? 'Product updated successfully' : 'Product created successfully');
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.model ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product model"
              />
              {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="inverter">Inverter</option>
                <option value="battery">Battery</option>
                <option value="solar_panel">Solar Panel</option>
                <option value="charge_controller">Charge Controller</option>
                <option value="monitoring_system">Monitoring System</option>
                <option value="accessories">Accessories</option>
              </select>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Points *
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleInputChange}
                min="1"
                max="10000"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.points ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter points value"
              />
              {errors.points && <p className="text-red-500 text-sm mt-1">{errors.points}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Manufacturer
            </label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter manufacturer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter product description"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Active Product
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
