import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  QrCodeIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  CpuChipIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AdminSerialNumbers = () => {
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    installer: '',
    startDate: '',
    endDate: '',
    product: '',
    city: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSerials();
  }, [currentPage, filters]);

  // Test function for debugging
  const testSerialService = async () => {
    console.log('🧪 Testing adminService.getAllSerials directly...');
    try {
      const result = await adminService.getAllSerials(1, 5, {});
      console.log('✅ Direct test successful:', result);
      toast.success('Serial service test successful!');
    } catch (error) {
      console.error('❌ Direct test failed:', error);
      toast.error(`Serial service test failed: ${error.message}`);
    }
  };

  const fetchSerials = async () => {
    try {
      setLoading(true);
      console.log('🔍 Admin SerialNumbers: Fetching serials with params:', { currentPage, filters });

      const response = await adminService.getAllSerials(currentPage, 10, filters);
      console.log('✅ Admin SerialNumbers: Response received:', response);

      if (response && response.success && response.data) {
        setSerials(response.data.serials || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setSummary(response.data.summary || {});
        console.log('✅ Admin SerialNumbers: Data set successfully');
      } else {
        console.error('❌ Admin SerialNumbers: Invalid response format:', response);
        setSerials([]);
        setTotalPages(1);
        setSummary({});
        toast.error('Invalid response format from server');
      }
    } catch (error) {
      console.error('❌ Admin SerialNumbers: Fetch serials error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });

      toast.error(`Failed to fetch serial numbers: ${error.message}`);
      setSerials([]);
      setTotalPages(1);
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      installer: '',
      startDate: '',
      endDate: '',
      product: '',
      city: ''
    });
    setCurrentPage(1);
  };

  const handleDeleteSerial = async (serialId, serialNumber) => {
    if (!window.confirm(`Are you sure you want to delete serial number ${serialNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(true);
      await adminService.deleteSerial(serialId);
      toast.success('Serial number deleted successfully');
      fetchSerials(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete serial number');
      console.error('Delete serial error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Layout title="Serial Numbers Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Serial Numbers Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              View and manage all submitted serial numbers from installers
            </p>
          </div>

          {/* Debug Test Button */}
          <button
            onClick={testSerialService}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded-lg transition-colors w-full sm:w-auto touch-manipulation"
          >
            Test Service
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <QrCodeIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Serials</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalSerials || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Installers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.uniqueInstallers || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CpuChipIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Models</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.uniqueProducts || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapPinIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cities</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.uniqueCities || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-outline flex items-center"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                <button
                  onClick={clearFilters}
                  className="btn-outline"
                >
                  Clear All
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Installer
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={filters.installer}
                    onChange={(e) => handleFilterChange('installer', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SunX-5000"
                    value={filters.product}
                    onChange={(e) => handleFilterChange('product', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Lahore"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Serial Numbers Table */}
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : serials.length === 0 ? (
              <div className="text-center py-8">
                <QrCodeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {Object.values(filters).some(f => f) ? 'No serial numbers found matching your filters' : 'No serial numbers submitted yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Serial Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Installer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Product Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Installation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {serials.map((serial) => (
                        <tr key={serial.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <QrCodeIcon className="h-8 w-8 text-primary-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {serial.serialNumber}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Added {formatDate(serial.createdAt)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              <div className="font-medium">{serial.installer?.name || 'Unknown'}</div>
                              <div className="text-gray-500 dark:text-gray-400">
                                {serial.installer?.loyaltyCardId || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              <div className="font-medium">{serial.inverterModel}</div>
                              <div className="text-gray-500 dark:text-gray-400">
                                {serial.capacity}W capacity
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              <div className="flex items-center mb-1">
                                <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                {formatDate(serial.installationDate)}
                              </div>
                              <div className="flex items-center">
                                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                                {serial.location.city}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteSerial(serial.id, serial.serialNumber)}
                              disabled={deleteLoading}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete serial number"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
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
                      Page {currentPage} of {totalPages} ({summary.filteredCount} of {summary.totalSerials} serials)
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
      </div>
    </Layout>
  );
};

export default AdminSerialNumbers;
