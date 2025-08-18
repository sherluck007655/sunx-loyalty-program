import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import InstallerProfileModal from '../../components/InstallerProfileModal';
import EditInstallerForm from '../../components/EditInstallerForm';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AdminInstallers = () => {
  const [installers, setInstallers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInstaller, setSelectedInstaller] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [summary, setSummary] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [installerPassword, setInstallerPassword] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInstaller, setEditingInstaller] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingInstaller, setDeletingInstaller] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchInstallers();
  }, [currentPage, selectedStatus, searchTerm]);

  const fetchInstallers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching installers...');
      const response = await adminService.getInstallers(currentPage, 10, searchTerm, selectedStatus);
      console.log('✅ Installers response:', response);

      // Safely access response data with fallbacks
      const installersData = response?.data?.installers || [];
      const paginationData = response?.data?.pagination || { pages: 1 };
      const summaryData = response?.data?.summary || { total: 0, approved: 0, pending: 0, rejected: 0 };

      setInstallers(installersData);
      setTotalPages(paginationData.pages);
      setSummary(summaryData);

      console.log('✅ State updated successfully');
    } catch (error) {
      console.error('❌ Fetch installers error:', error);
      toast.error('Failed to fetch installers: ' + error.message);
      setInstallers([]);
      setTotalPages(1);
      setSummary({ total: 0, approved: 0, pending: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (installerId, status, reason = '') => {
    try {
      setActionLoading(true);

      // Defensive check for installer ID
      if (!installerId) {
        throw new Error('Installer ID is missing');
      }

      console.log('🔄 Updating installer status:', { installerId, status, reason });

      const statusData = { status, reason };
      await adminService.updateInstallerStatus(installerId, statusData);
      toast.success(`Installer ${status} successfully`);

      // Refresh installers list
      fetchInstallers();
      setShowModal(false);
      setSelectedInstaller(null);
    } catch (error) {
      toast.error(`Failed to ${status} installer: ${error.message}`);
      console.error('Update installer status error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const openInstallerModal = (installer) => {
    if (!installer) {
      toast.error('Installer data is missing');
      return;
    }
    console.log('👁️ Opening installer modal for:', installer.name);
    setSelectedInstaller(installer);
    setShowModal(true);
  };

  // Handle password reset and viewing
  const handleResetPassword = async (installer) => {
    try {
      setActionLoading(true);

      // Defensive check for installer object
      if (!installer) {
        throw new Error('Installer data is missing');
      }

      const installerId = installer.id || installer._id;
      if (!installerId) {
        throw new Error('Installer ID is missing');
      }

      console.log('🔑 Resetting password for installer:', { id: installerId, name: installer.name, email: installer.email });

      const response = await adminService.resetInstallerPassword(installerId);
      setInstallerPassword(response.data.newPassword);
      setSelectedInstaller(installer);
      setShowPasswordModal(true);
      toast.success(`New password generated for ${installer.name}`);
    } catch (error) {
      toast.error('Failed to reset password: ' + error.message);
      console.error('Reset password error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit installer
  const handleEditInstaller = (installer) => {
    if (!installer) {
      toast.error('Installer data is missing');
      return;
    }
    console.log('✏️ Editing installer:', installer.name);
    setEditingInstaller(installer);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (editedData) => {
    try {
      setActionLoading(true);
      await adminService.updateInstallerProfile(editingInstaller.id, editedData);
      toast.success('Installer profile updated successfully');
      fetchInstallers();
      setShowEditModal(false);
      setEditingInstaller(null);
    } catch (error) {
      toast.error('Failed to update installer profile');
      console.error('Update installer error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Excel export
  const handleExportToExcel = async () => {
    try {
      setExportLoading(true);
      console.log('📊 Starting Excel export...');

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Call the export API
      const response = await fetch('/api/admin/installers/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export failed');
      }

      // Get the filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'SunX_Installers.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Installers exported to Excel successfully!');
      console.log('✅ Excel export completed:', filename);

    } catch (error) {
      console.error('❌ Excel export error:', error);
      toast.error('Failed to export installers: ' + error.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Handle delete installer
  const handleDeleteInstaller = (installer) => {
    if (!installer) {
      toast.error('Installer data is missing');
      return;
    }
    console.log('🗑️ Preparing to delete installer:', installer.name);
    setDeletingInstaller(installer);
    setShowDeleteModal(true);
  };

  const confirmDeleteInstaller = async () => {
    try {
      setActionLoading(true);
      await adminService.deleteInstaller(deletingInstaller.id);
      toast.success('Installer account deleted successfully');
      fetchInstallers();
      setShowDeleteModal(false);
      setDeletingInstaller(null);
    } catch (error) {
      toast.error('Failed to delete installer account');
      console.error('Delete installer error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      suspended: { color: 'bg-orange-100 text-orange-800', icon: ExclamationTriangleIcon }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Layout title="Manage Installers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Manage Installers
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              View and manage installer accounts and performance
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleExportToExcel}
              disabled={exportLoading}
              className="btn-primary flex items-center justify-center gap-2 px-4 py-2 text-sm"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              {exportLoading ? 'Exporting...' : 'Export to Excel'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="card">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Installers</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{summary.totalInstallers || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Approved</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{summary.approvedInstallers || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{summary.pendingInstallers || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Installations</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{summary.totalInstallations || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCardIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Earnings</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalEarnings || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or loyalty card ID..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="form-input pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusFilter('')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedStatus === ''
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleStatusFilter('approved')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedStatus === 'approved'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => handleStatusFilter('pending')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedStatus === 'pending'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => handleStatusFilter('rejected')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedStatus === 'rejected'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Installers Table */}
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : installers.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || selectedStatus ? 'No installers found matching your criteria' : 'No installers registered yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Installer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Performance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {installers.filter(installer => installer && (installer.id || installer._id)).map((installer) => (
                        <tr key={installer.id || installer._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                    {installer.name?.charAt(0).toUpperCase() || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {installer.name || 'Unknown Name'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {installer.loyaltyCardId || 'No ID'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              <div className="flex items-center mb-1">
                                <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                {installer.email || 'No email'}
                              </div>
                              <div className="flex items-center mb-1">
                                <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                                {installer.phone || 'No phone'}
                              </div>
                              <div className="flex items-center">
                                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                                {installer.city || 'No city'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              <div className="mb-1">
                                <span className="font-medium">{installer.totalInstallations || 0}</span> installations
                              </div>
                              <div className="mb-1">
                                <span className="font-medium">{formatCurrency(installer.totalEarnings || 0)}</span> earned
                              </div>
                              <div className="text-xs text-gray-500">
                                {installer.performance?.averageRating || 0}★ rating
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(installer.status || 'pending')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openInstallerModal(installer)}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-2"
                              title="View Profile"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(installer)}
                              disabled={actionLoading}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                              title="Reset Password"
                            >
                              <KeyIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditInstaller(installer)}
                              disabled={actionLoading}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 mr-2"
                              title="Edit Profile"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteInstaller(installer)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-2"
                              title="Delete Account"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                            {installer.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(installer.id || installer._id, 'approved', 'Approved by admin')}
                                  disabled={actionLoading}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-2"
                                  title="Approve Installer"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(installer.id || installer._id, 'rejected', 'Rejected by admin')}
                                  disabled={actionLoading}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title="Reject Installer"
                                >
                                  <XCircleIcon className="h-5 w-5" />
                                </button>
                              </>
                            ) : installer.status === 'approved' ? (
                              <button
                                onClick={() => handleStatusUpdate(installer.id || installer._id, 'suspended', 'Suspended by admin')}
                                disabled={actionLoading}
                                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                                title="Suspend Installer"
                              >
                                <ExclamationTriangleIcon className="h-5 w-5" />
                              </button>
                            ) : installer.status === 'suspended' ? (
                              <button
                                onClick={() => handleStatusUpdate(installer.id || installer._id, 'approved', 'Reactivated by admin')}
                                disabled={actionLoading}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Reactivate Installer"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="btn-outline"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="btn-outline"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* Installer Profile Modal */}
        <InstallerProfileModal
          installer={selectedInstaller}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedInstaller(null);
          }}
          onUpdate={fetchInstallers}
        />

        {/* Password Reset Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">
                🔑 New Password Generated
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  New password for <strong>{selectedInstaller?.name}</strong>:
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-3 rounded-md">
                  <code className="text-lg font-mono text-green-800 dark:text-green-200 font-bold">
                    {installerPassword}
                  </code>
                </div>
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    ⚠️ <strong>Important:</strong> This is a new password that has replaced the old one.
                    Please share this securely with the installer.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(installerPassword);
                    toast.success('New password copied to clipboard');
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  📋 Copy New Password
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setInstallerPassword('');
                    setSelectedInstaller(null);
                  }}
                  className="btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Installer Modal */}
        {showEditModal && editingInstaller && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Edit Installer Profile
              </h3>
              <EditInstallerForm
                installer={editingInstaller}
                onSave={handleSaveEdit}
                onCancel={() => {
                  setShowEditModal(false);
                  setEditingInstaller(null);
                }}
                loading={actionLoading}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingInstaller && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                Delete Installer Account
              </h3>
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Are you sure you want to delete this installer account?
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    {deletingInstaller.name}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {deletingInstaller.email}
                  </p>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mt-3">
                  ⚠️ This action cannot be undone. All associated data (serial numbers, payments) will also be deleted.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingInstaller(null);
                  }}
                  className="btn-outline"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteInstaller}
                  disabled={actionLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminInstallers;
