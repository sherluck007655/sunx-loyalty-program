import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  DocumentArrowUpIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const ValidSerials = () => {
  const [validSerials, setValidSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchValidSerials();
  }, []);

  const fetchValidSerials = async () => {
    try {
      setLoading(true);
      const response = await adminService.getValidSerials(1, 100); // Get first 100 serials
      setValidSerials(response.data.serials || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch valid serial numbers');
      console.error('Fetch valid serials error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!csvData.trim()) {
      toast.error('Please enter CSV data');
      return;
    }

    try {
      setUploading(true);
      const response = await adminService.uploadValidSerials(csvData);
      toast.success(response.message);
      setShowUploadModal(false);
      setCsvData('');
      fetchValidSerials();
    } catch (error) {
      toast.error(error.message || 'Failed to upload serial numbers');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSerial = async () => {
    if (!newSerial.trim()) {
      toast.error('Please enter a serial number');
      return;
    }

    try {
      setAdding(true);
      const response = await adminService.addValidSerial(newSerial);
      toast.success(response.message);
      setShowAddModal(false);
      setNewSerial('');
      fetchValidSerials();
    } catch (error) {
      toast.error(error.message || 'Failed to add serial number');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveSerial = async (serialNumber) => {
    if (!window.confirm(`Are you sure you want to remove serial number ${serialNumber}?`)) {
      return;
    }

    try {
      const response = await adminService.removeValidSerial(serialNumber);
      toast.success(response.message);
      fetchValidSerials();
    } catch (error) {
      toast.error(error.message || 'Failed to remove serial number');
    }
  };

  const filteredSerials = validSerials.filter(serial =>
    serial.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Valid Serial Numbers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Valid Serial Numbers
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage the list of valid serial numbers that installers can register
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-sm px-3 py-2 w-full sm:w-auto touch-manipulation"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Serial</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-secondary text-sm px-3 py-2 w-full sm:w-auto touch-manipulation"
            >
              <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Upload CSV</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Valid Serials
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {validSerials.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search serial numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>

        {/* Serial Numbers List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Serial Numbers ({filteredSerials.length})
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredSerials.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No serial numbers match your search' : 'No valid serial numbers found'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSerials.map((serial, index) => (
                  <div
                    key={serial.id || index}
                    className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {serial.serialNumber}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          serial.isUsed
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {serial.isUsed ? 'Used' : 'Available'}
                        </span>
                        <button
                          onClick={() => handleRemoveSerial(serial.serialNumber)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Remove serial number"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {serial.notes && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {serial.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Added: {new Date(serial.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload Serial Numbers (CSV)
              </h3>
              <div className="mb-4">
                <label className="form-label">
                  CSV Data (one serial number per line)
                </label>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  className="form-input"
                  rows="10"
                  placeholder="SUNX001001&#10;SUNX001002&#10;SUNX001003&#10;..."
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Format: One serial number per line. Headers will be ignored.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setCsvData('');
                  }}
                  disabled={uploading}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary"
                >
                  {uploading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Uploading...</span>
                    </>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Serial Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add Serial Number
              </h3>
              <div className="mb-4">
                <label className="form-label">Serial Number</label>
                <input
                  type="text"
                  value={newSerial}
                  onChange={(e) => setNewSerial(e.target.value.toUpperCase())}
                  className="form-input"
                  placeholder="SUNX001001"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewSerial('');
                  }}
                  disabled={adding}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSerial}
                  disabled={adding}
                  className="btn-primary"
                >
                  {adding ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Adding...</span>
                    </>
                  ) : (
                    'Add Serial'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ValidSerials;
