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
      
      const backupData = {
        metadata: {
          version: '1.0',
          timestamp: new Date().toISOString(),
          type: options.type || 'manual',
          description: options.description || 'Manual backup',
          size: 0
        },
        data: {}
      };

      // Include user data if requested
      if (options.includeUserData !== false) {
        try {
          backupData.data.installers = mockStorageHelpers.getAllInstallers();
          backupData.data.serials = mockStorageHelpers.getAllSerials(1, 10000);
          backupData.data.payments = mockStorageHelpers.getPayments(1, 10000);
          backupData.data.validSerials = mockStorageHelpers.getAllValidSerials();
          console.log('✅ User data included in backup');
        } catch (error) {
          console.error('❌ Error including user data:', error);
          throw new Error('Failed to include user data: ' + error.message);
        }
      }

      // Include system data if requested
      if (options.includeSystemData !== false) {
        try {
          backupData.data.promotions = mockStorageHelpers.getAllPromotions();
          backupData.data.promotionParticipations = mockStorageHelpers.getAllPromotionParticipations();
          backupData.data.notifications = this.getNotifications();
          backupData.data.settings = this.getSystemSettings();
          console.log('✅ System data included in backup');
        } catch (error) {
          console.error('❌ Error including system data:', error);
          throw new Error('Failed to include system data: ' + error.message);
        }
      }

      // Calculate backup size
      const backupString = JSON.stringify(backupData);
      backupData.metadata.size = new Blob([backupString]).size;

      // Generate backup ID
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      backupData.metadata.id = backupId;

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
      toast.success('Backup created successfully!');

      return {
        success: true,
        backupId,
        data: backupData,
        size: backupData.metadata.size
      };

    } catch (error) {
      console.error('❌ Error creating backup:', error);
      toast.error('Failed to create backup');
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

      // Restore user data
      if (backupData.data.installers) {
        // Clear existing data and restore
        mockStorageHelpers.clearAllData();
        
        // Restore installers
        backupData.data.installers.forEach(installer => {
          mockStorageHelpers.addInstaller(installer);
        });

        // Restore serials
        if (backupData.data.serials && backupData.data.serials.serials) {
          backupData.data.serials.serials.forEach(serial => {
            mockStorageHelpers.addSerial(serial);
          });
        }

        // Restore payments
        if (backupData.data.payments && backupData.data.payments.payments) {
          backupData.data.payments.payments.forEach(payment => {
            mockStorageHelpers.addPayment(payment);
          });
        }
      }

      console.log('✅ Backup restored successfully');
      toast.success('Backup restored successfully!');
      
      return { success: true };

    } catch (error) {
      console.error('❌ Error restoring backup:', error);
      toast.error('Failed to restore backup');
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
        includeSystemData: this.backupSettings.includeSystemData
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
