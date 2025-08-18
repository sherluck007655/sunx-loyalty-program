import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { backupService } from '../../services/backupService';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const BackupManagement = () => {
  const [backupHistory, setBackupHistory] = useState([]);
  const [backupSettings, setBackupSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBackupHistory(backupService.getBackupHistory());
    setBackupSettings(backupService.getBackupSettings());
    setLoading(false);
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const result = await backupService.createBackup({
        type: 'manual',
        description: 'Manual backup created by admin',
        includeUserData: true,
        includeSystemData: true
      });

      if (result.success) {
        loadData(); // Refresh the history
        
        // Auto-download the backup
        const filename = `sunx_backup_${new Date().toISOString().split('T')[0]}.json`;
        backupService.downloadBackup(result.data, filename);
      }
    } catch (error) {
      console.error('Backup creation error:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (backupId) => {
    try {
      // For demo purposes, create a new backup with the same settings
      const result = await backupService.createBackup({
        type: 'download',
        description: 'Downloaded backup',
        includeUserData: true,
        includeSystemData: true
      });

      if (result.success) {
        const filename = `sunx_backup_${backupId}_${new Date().toISOString().split('T')[0]}.json`;
        backupService.downloadBackup(result.data, filename);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download backup');
    }
  };

  const handleSettingsUpdate = (newSettings) => {
    backupService.updateBackupSettings(newSettings);
    setBackupSettings(backupService.getBackupSettings());
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setRestoreFile(file);
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreFile) {
      toast.error('Please select a backup file');
      return;
    }

    try {
      const fileContent = await restoreFile.text();
      const backupData = JSON.parse(fileContent);
      
      const result = await backupService.restoreFromBackup(backupData);
      
      if (result.success) {
        setRestoreFile(null);
        // Reset file input
        document.getElementById('restore-file-input').value = '';
      }
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore backup. Please check the file format.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'automatic':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'manual':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Backup Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, download, and manage system backups
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="btn btn-secondary"
            >
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              Settings
            </button>
            <button
              onClick={handleCreateBackup}
              disabled={creating}
              className="btn btn-primary"
            >
              {creating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                  Create Backup
                </>
              )}
            </button>
          </div>
        </div>

        {/* Backup Settings */}
        {showSettings && (
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Backup Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={backupSettings.autoBackup}
                      onChange={(e) => handleSettingsUpdate({ autoBackup: e.target.checked })}
                      className="form-checkbox"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Enable automatic backups
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={backupSettings.frequency}
                    onChange={(e) => handleSettingsUpdate({ frequency: e.target.value })}
                    className="form-select"
                    disabled={!backupSettings.autoBackup}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={backupSettings.retentionDays}
                    onChange={(e) => handleSettingsUpdate({ retentionDays: parseInt(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={backupSettings.includeUserData}
                      onChange={(e) => handleSettingsUpdate({ includeUserData: e.target.checked })}
                      className="form-checkbox"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Include user data
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={backupSettings.includeSystemData}
                      onChange={(e) => handleSettingsUpdate({ includeSystemData: e.target.checked })}
                      className="form-checkbox"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Include system data
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restore Section */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Restore from Backup
            </h3>
            
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  id="restore-file-input"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="form-input"
                />
              </div>
              <button
                onClick={handleRestoreBackup}
                disabled={!restoreFile}
                className="btn btn-secondary"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Restore
              </button>
            </div>
            
            {restoreFile && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected file: {restoreFile.name} ({backupService.formatFileSize(restoreFile.size)})
              </div>
            )}
            
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> Restoring a backup will replace all current data. 
                    Make sure to create a backup of current data before proceeding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backup History */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Backup History
            </h3>

            {backupHistory.length === 0 ? (
              <div className="text-center py-8">
                <CloudArrowDownIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No backups found. Create your first backup to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {backupHistory.map((backup) => (
                      <tr key={backup.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusIcon(backup.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(backup.type)}`}>
                            {backup.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {backup.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(backup.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {backupService.formatFileSize(backup.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDownloadBackup(backup.id)}
                            className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 mr-3"
                          >
                            <DocumentArrowDownIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BackupManagement;
