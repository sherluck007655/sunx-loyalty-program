import { mockStorageHelpers } from './mockStorage';
import toast from 'react-hot-toast';

class BackupService {
  constructor() {
    this.backupHistory = this.loadBackupHistory();
    this.backupSettings = this.loadBackupSettings();
  }

  // Load backup history from localStorage
  loadBackupHistory() {
    try {
      const history = localStorage.getItem('sunx_backup_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading backup history:', error);
      return [];
    }
  }

  // Save backup history to localStorage
  saveBackupHistory() {
    try {
      localStorage.setItem('sunx_backup_history', JSON.stringify(this.backupHistory));
    } catch (error) {
      console.error('Error saving backup history:', error);
    }
  }

  // Load backup settings from localStorage
  loadBackupSettings() {
    try {
      const settings = localStorage.getItem('sunx_backup_settings');
      return settings ? JSON.parse(settings) : {
        autoBackup: true,
        frequency: 'daily', // daily, weekly, monthly
        retentionDays: 30,
        includeUserData: true,
        includeSystemData: true,
        lastAutoBackup: null
      };
    } catch (error) {
      console.error('Error loading backup settings:', error);
      return {
        autoBackup: true,
        frequency: 'daily',
        retentionDays: 30,
        includeUserData: true,
        includeSystemData: true,
        lastAutoBackup: null
      };
    }
  }

  // Save backup settings to localStorage
  saveBackupSettings() {
    try {
      localStorage.setItem('sunx_backup_settings', JSON.stringify(this.backupSettings));
    } catch (error) {
      console.error('Error saving backup settings:', error);
    }
  }

  // Create a complete backup of all data
  async createBackup(options = {}) {
    try {
      console.log('🔄 Creating backup...');

      // Call backend API to create backup
      const response = await fetch('/api/admin/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: options.type || 'manual',
          description: options.description || 'Manual backup'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create backup');
      }

      const result = await response.json();
      const backupData = result.data;

      console.log('✅ Backup created successfully');

      // Generate backup ID
      const backupId = backupData.metadata.id || `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add to backup history
      const historyEntry = {
        id: backupId,
        timestamp: backupData.metadata.timestamp,
        type: backupData.metadata.type,
        description: backupData.metadata.description,
        size: backupData.metadata.size,
        status: 'completed'
      };

      this.backupHistory.unshift(historyEntry);

      // Keep only recent backups based on retention settings
      this.cleanupOldBackups();

      this.saveBackupHistory();

      console.log('✅ Backup created successfully:', backupId);
      if (!options.silent) {
        toast.success('Backup created successfully!');
      }

      return {
        success: true,
        backupId,
        data: backupData,
        size: backupData.metadata.size
      };

    } catch (error) {
      console.error('❌ Error creating backup:', error);
      if (!options.silent) {
        toast.error('Failed to create backup');
      }
      return { success: false, error: error.message };
    }
  }

  // Download backup as JSON file
  downloadBackup(backupData, filename) {
    try {
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `sunx_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      console.log('✅ Backup downloaded successfully');
      toast.success('Backup downloaded successfully!');
      
      return true;
    } catch (error) {
      console.error('❌ Error downloading backup:', error);
      toast.error('Failed to download backup');
      return false;
    }
  }

  // Restore data from backup
  async restoreFromBackup(backupData) {
    try {
      console.log('🔄 Restoring from backup...');

      if (!backupData || !backupData.data) {
        throw new Error('Invalid backup data');
      }

      // Show confirmation dialog
      const confirmed = window.confirm(
        '⚠️ WARNING: This will replace ALL current data with the backup data. This action cannot be undone. Are you sure you want to continue?'
      );

      if (!confirmed) {
        return { success: false, error: 'Restore cancelled by user' };
      }

      // Call backend API to restore backup
      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ backupData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to restore backup');
      }

      const result = await response.json();

      console.log('✅ Backup restored successfully');
      toast.success('Backup restored successfully! Page will reload in 3 seconds...');

      // Reload page after 3 seconds to refresh all data
      setTimeout(() => {
        window.location.reload();
      }, 3000);

      return { success: true, data: result.data };

    } catch (error) {
      console.error('❌ Error restoring backup:', error);
      toast.error('Failed to restore backup: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // Get backup history
  getBackupHistory() {
    return this.backupHistory;
  }

  // Get backup settings
  getBackupSettings() {
    return this.backupSettings;
  }

  // Update backup settings
  updateBackupSettings(newSettings) {
    this.backupSettings = { ...this.backupSettings, ...newSettings };
    this.saveBackupSettings();
    console.log('✅ Backup settings updated');
    toast.success('Backup settings updated!');
  }

  // Check if auto backup is needed
  shouldCreateAutoBackup() {
    if (!this.backupSettings.autoBackup) return false;
    
    const lastBackup = this.backupSettings.lastAutoBackup;
    if (!lastBackup) return true;
    
    const lastBackupDate = new Date(lastBackup);
    const now = new Date();
    const diffHours = (now - lastBackupDate) / (1000 * 60 * 60);
    
    switch (this.backupSettings.frequency) {
      case 'daily':
        return diffHours >= 24;
      case 'weekly':
        return diffHours >= 168; // 7 days
      case 'monthly':
        return diffHours >= 720; // 30 days
      default:
        return false;
    }
  }

  // Create auto backup if needed
  async createAutoBackupIfNeeded() {
    if (this.shouldCreateAutoBackup()) {
      const result = await this.createBackup({
        type: 'automatic',
        description: `Automatic ${this.backupSettings.frequency} backup`,
        includeUserData: this.backupSettings.includeUserData,
        includeSystemData: this.backupSettings.includeSystemData,
        // Do not show toasts for automatic, background backups
        silent: true
      });

      if (result.success) {
        this.backupSettings.lastAutoBackup = new Date().toISOString();
        this.saveBackupSettings();
      }

      return result;
    }

    return { success: true, message: 'No backup needed' };
  }

  // Clean up old backups based on retention settings
  cleanupOldBackups() {
    const retentionMs = this.backupSettings.retentionDays * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - retentionMs);
    
    this.backupHistory = this.backupHistory.filter(backup => {
      return new Date(backup.timestamp) > cutoffDate;
    });
  }

  // Get notifications (placeholder)
  getNotifications() {
    try {
      const notifications = localStorage.getItem('sunx_notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      return [];
    }
  }

  // Get system settings (placeholder)
  getSystemSettings() {
    return {
      theme: localStorage.getItem('theme') || 'light',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const backupService = new BackupService();

// Initialize auto backup check on service load
backupService.createAutoBackupIfNeeded();
