import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  GiftIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  TrophyIcon,
  UserGroupIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const getDefaultFormData = () => ({
    title: '',
    description: '',
    type: 'installation_target',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    target: {
      type: 'installations',
      value: 10,
      period: 'monthly'
    },
    rewards: {
      type: 'cash',
      amount: 10000,
      description: 'PKR 10,000 bonus payment'
    },
    eligibility: {
      minInstallations: 0,
      installerStatus: 'approved',
      newInstallersOnly: false
    }
  });

  const [formData, setFormData] = useState(getDefaultFormData());

  useEffect(() => {
    fetchPromotions();
    fetchStats();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPromotions();
      setPromotions(response.data.promotions);
    } catch (error) {
      toast.error('Failed to fetch promotions');
      console.error('Fetch promotions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminService.getPromotionStats();
      setStats(response.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form data
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!formData.target.value || formData.target.value <= 0) {
      newErrors.targetValue = 'Target value must be greater than 0';
    }
    if (!formData.rewards.amount || formData.rewards.amount <= 0) {
      newErrors.rewardAmount = 'Reward amount must be greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data with proper date format
      const submitData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate + 'T23:59:59').toISOString(),
        target: {
          ...formData.target,
          value: parseInt(formData.target.value) || 0
        },
        rewards: {
          ...formData.rewards,
          amount: parseInt(formData.rewards.amount) || 0,
          description: formData.rewards.description || `PKR ${parseInt(formData.rewards.amount) || 0} ${formData.rewards.type.replace('_', ' ')} reward`
        },
        eligibility: {
          ...formData.eligibility,
          minInstallations: parseInt(formData.eligibility.minInstallations) || 0
        }
      };

      if (selectedPromotion) {
        await adminService.updatePromotion(selectedPromotion.id, submitData);
        toast.success('Promotion updated successfully');
        setShowEditModal(false);
      } else {
        await adminService.createPromotion(submitData);
        toast.success('Promotion created successfully');
        setShowCreateModal(false);
      }

      resetForm();
      fetchPromotions();
      fetchStats();
    } catch (error) {
      console.error('Promotion save error:', error);
      toast.error(error.message || 'Failed to save promotion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description,
      type: promotion.type,
      status: promotion.status,
      startDate: promotion.startDate.split('T')[0],
      endDate: promotion.endDate.split('T')[0],
      target: promotion.target,
      rewards: promotion.rewards,
      eligibility: promotion.eligibility
    });
    setShowEditModal(true);
  };

  const handleView = (promotion) => {
    setSelectedPromotion(promotion);
    setShowViewModal(true);
  };

  const handleDelete = async (promotionId) => {
    if (!window.confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deletePromotion(promotionId);
      toast.success('Promotion deleted successfully');
      fetchPromotions();
      fetchStats();
    } catch (error) {
      toast.error(error.message || 'Failed to delete promotion');
    }
  };

  const resetForm = () => {
    setFormData(getDefaultFormData());
    setSelectedPromotion(null);
    setErrors({});
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'Inactive' },
      expired: { color: 'bg-red-100 text-red-800', text: 'Expired' }
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      installation_target: 'Installation Target',
      milestone: 'Milestone',
      quality_target: 'Quality Target',
      geographic_expansion: 'Geographic Expansion'
    };
    return typeLabels[type] || type;
  };

  return (
    <Layout title="Manage Promotions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Manage Promotions
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Create and manage promotional campaigns for installers
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center text-sm sm:text-base px-3 py-2 sm:px-4 w-full sm:w-auto touch-manipulation"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">Create Promotion</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="card">
              <div className="card-body p-4">
                <div className="flex items-center">
                  <GiftIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500" />
                  <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                      Total Promotions
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalPromotions}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body p-4">
                <div className="flex items-center">
                  <TrophyIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                  <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                      Active
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.activePromotions}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body p-4">
                <div className="flex items-center">
                  <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                  <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                      Participations
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalParticipations}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body p-4">
                <div className="flex items-center">
                  <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                  <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                      Rate
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.averageParticipationRate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Promotions List */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Promotions
            </h2>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : promotions.length === 0 ? (
              <div className="text-center py-8">
                <GiftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No promotions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Promotion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Reward
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {promotions.map((promotion) => (
                      <tr key={promotion.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {promotion.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {promotion.description.length > 50
                                ? `${promotion.description.substring(0, 50)}...`
                                : promotion.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {getTypeLabel(promotion.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(promotion.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div>
                            <div>{formatDate(promotion.startDate)}</div>
                            <div>to {formatDate(promotion.endDate)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(promotion.rewards?.amount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/admin/promotions/${promotion.id}`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleEdit(promotion)}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                              title="Edit promotion"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(promotion.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete promotion"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Promotion Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedPromotion ? 'Edit Promotion' : 'Create New Promotion'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, title: e.target.value }));
                          if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                        }}
                        className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>
                    <div>
                      <label className="form-label">Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="form-input"
                        required
                      >
                        <option value="installation_target">Installation Target</option>
                        <option value="milestone">Milestone</option>
                        <option value="quality_target">Quality Target</option>
                        <option value="geographic_expansion">Geographic Expansion</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, description: e.target.value }));
                        if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                      }}
                      className={`form-input ${errors.description ? 'border-red-500' : ''}`}
                      rows="3"
                      required
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Start Date *</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">End Date *</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  {/* Target Configuration */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Target Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Target Value *</label>
                        <input
                          type="number"
                          value={formData.target.value}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            target: { ...prev.target, value: parseInt(e.target.value) || 0 }
                          }))}
                          className="form-input"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Period</label>
                        <select
                          value={formData.target.period}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            target: { ...prev.target, period: e.target.value }
                          }))}
                          className="form-input"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="lifetime">Lifetime</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Rewards Configuration */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Rewards Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Reward Amount (PKR) *</label>
                        <input
                          type="number"
                          value={formData.rewards.amount}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            rewards: { ...prev.rewards, amount: parseInt(e.target.value) || 0 }
                          }))}
                          className="form-input"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Reward Type</label>
                        <select
                          value={formData.rewards.type}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            rewards: { ...prev.rewards, type: e.target.value }
                          }))}
                          className="form-input"
                        >
                          <option value="cash">Cash</option>
                          <option value="cash_and_recognition">Cash + Recognition</option>
                          <option value="recognition">Recognition Only</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="form-label">Reward Description</label>
                      <input
                        type="text"
                        value={formData.rewards.description}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          rewards: { ...prev.rewards, description: e.target.value }
                        }))}
                        className="form-input"
                        placeholder="e.g., PKR 10,000 bonus payment"
                      />
                    </div>
                  </div>

                  {/* Eligibility Configuration */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Eligibility Requirements
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Minimum Installations</label>
                        <input
                          type="number"
                          value={formData.eligibility.minInstallations}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            eligibility: { ...prev.eligibility, minInstallations: parseInt(e.target.value) || 0 }
                          }))}
                          className="form-input"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="form-label">Installer Status</label>
                        <select
                          value={formData.eligibility.installerStatus}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            eligibility: { ...prev.eligibility, installerStatus: e.target.value }
                          }))}
                          className="form-input"
                        >
                          <option value="approved">Approved Only</option>
                          <option value="pending">Pending Only</option>
                          <option value="">Any Status</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.eligibility.newInstallersOnly}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            eligibility: { ...prev.eligibility, newInstallersOnly: e.target.checked }
                          }))}
                          className="form-checkbox"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          New installers only (joined within 30 days)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="border-t pt-4">
                    <label className="form-label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="form-input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        resetForm();
                      }}
                      disabled={submitting}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary"
                    >
                      {submitting ? (
                        <>
                          <LoadingSpinner size="sm" color="white" />
                          <span className="ml-2">
                            {selectedPromotion ? 'Updating...' : 'Creating...'}
                          </span>
                        </>
                      ) : (
                        selectedPromotion ? 'Update Promotion' : 'Create Promotion'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Promotion Modal */}
        {showViewModal && selectedPromotion && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Promotion Details
                  </h3>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedPromotion(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Basic Information
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Title:</span>
                          <p className="text-gray-900 dark:text-white">{selectedPromotion.title}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Type:</span>
                          <p className="text-gray-900 dark:text-white">{getTypeLabel(selectedPromotion.type)}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Description:</span>
                        <p className="text-gray-900 dark:text-white">{selectedPromotion.description}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Status:</span>
                          <div className="mt-1">{getStatusBadge(selectedPromotion.status)}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Created:</span>
                          <p className="text-gray-900 dark:text-white">{formatDate(selectedPromotion.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Period */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Campaign Period
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Start Date:</span>
                          <p className="text-gray-900 dark:text-white">{formatDate(selectedPromotion.startDate)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">End Date:</span>
                          <p className="text-gray-900 dark:text-white">{formatDate(selectedPromotion.endDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Target */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Target Requirements
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Target Value:</span>
                          <p className="text-gray-900 dark:text-white">{selectedPromotion.target?.value || 0}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Period:</span>
                          <p className="text-gray-900 dark:text-white capitalize">{selectedPromotion.target?.period || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rewards */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Rewards
                    </h4>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Amount:</span>
                          <p className="text-yellow-900 dark:text-yellow-100 font-semibold">
                            {formatCurrency(selectedPromotion.rewards?.amount || 0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Type:</span>
                          <p className="text-yellow-900 dark:text-yellow-100 capitalize">
                            {selectedPromotion.rewards?.type?.replace('_', ' ') || 'N/A'}
                          </p>
                        </div>
                      </div>
                      {selectedPromotion.rewards?.description && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Description:</span>
                          <p className="text-yellow-900 dark:text-yellow-100">{selectedPromotion.rewards.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Eligibility */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Eligibility Requirements
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Min Installations:</span>
                          <p className="text-gray-900 dark:text-white">{selectedPromotion.eligibility?.minInstallations || 0}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Installer Status:</span>
                          <p className="text-gray-900 dark:text-white capitalize">
                            {selectedPromotion.eligibility?.installerStatus || 'Any'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">New Installers Only:</span>
                        <p className="text-gray-900 dark:text-white">
                          {selectedPromotion.eligibility?.newInstallersOnly ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Created By */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Created By
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Admin:</span>
                          <p className="text-gray-900 dark:text-white">{selectedPromotion.createdBy?.name || 'Unknown'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Updated:</span>
                          <p className="text-gray-900 dark:text-white">{formatDate(selectedPromotion.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(selectedPromotion);
                    }}
                    className="btn-primary"
                  >
                    Edit Promotion
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedPromotion(null);
                    }}
                    className="btn-outline"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPromotions;
