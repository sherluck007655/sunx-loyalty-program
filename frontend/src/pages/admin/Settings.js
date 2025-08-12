import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import PasswordUpdate from '../../components/PasswordUpdate';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  UserGroupIcon,
  DocumentTextIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'SunX Loyalty Program',
      siteDescription: 'Solar inverter installer loyalty and rewards program',
      contactEmail: 'admin@sunx.com',
      supportPhone: '+92-300-1234567',
      timezone: 'Asia/Karachi',
      language: 'en',
      currency: 'PKR'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      promotionNotifications: true,
      paymentNotifications: true,
      systemAlerts: true,
      notificationFrequency: 'immediate'
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      twoFactorAuth: false,
      ipWhitelist: '',
      autoLogout: true
    },
    payments: {
      minPaymentAmount: 1000,
      maxPaymentAmount: 100000,
      paymentMethods: ['bank_transfer', 'mobile_wallet'],
      autoApproval: false,
      approvalThreshold: 5000,
      processingFee: 0,
      taxRate: 0
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info',
      backupFrequency: 'daily',
      dataRetention: 365,
      cacheEnabled: true,
      compressionEnabled: true
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'payments', name: 'Payments', icon: CurrencyDollarIcon },
    { id: 'system', name: 'System', icon: GlobeAltIcon }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch settings from the API
      // For now, we'll use the default settings
      toast.success('Settings loaded successfully');
    } catch (error) {
      toast.error('Failed to load settings');
      console.error('Settings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      // In a real app, you would save settings to the API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Settings save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default settings
      fetchSettings();
      toast.success('Settings reset to defaults');
    }
  };

  if (loading) {
    return (
      <Layout title="System Settings">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="System Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              System Settings
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Configure system preferences and behavior
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={resetSettings}
              className="btn-outline"
            >
              Reset to Defaults
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Saving...</span>
                </div>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="card">
              <div className="card-body">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      General Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Site Name
                        </label>
                        <input
                          type="text"
                          value={settings.general.siteName}
                          onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={settings.general.contactEmail}
                          onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Support Phone
                        </label>
                        <input
                          type="tel"
                          value={settings.general.supportPhone}
                          onChange={(e) => handleSettingChange('general', 'supportPhone', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Timezone
                        </label>
                        <select
                          value={settings.general.timezone}
                          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                          className="form-select"
                        >
                          <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Currency
                        </label>
                        <select
                          value={settings.general.currency}
                          onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                          className="form-select"
                        >
                          <option value="PKR">Pakistani Rupee (PKR)</option>
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                          <option value="GBP">British Pound (GBP)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site Description
                      </label>
                      <textarea
                        value={settings.general.siteDescription}
                        onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                        rows={3}
                        className="form-textarea"
                      />
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notification Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Notifications
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Send notifications via email
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            SMS Notifications
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Send notifications via SMS
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.smsNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Push Notifications
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Send browser push notifications
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.pushNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Promotion Notifications
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Notify users about new promotions
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.promotionNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'promotionNotifications', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Payment Notifications
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Notify about payment status changes
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.paymentNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'paymentNotifications', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notification Frequency
                      </label>
                      <select
                        value={settings.notifications.notificationFrequency}
                        onChange={(e) => handleSettingChange('notifications', 'notificationFrequency', e.target.value)}
                        className="form-select"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="hourly">Hourly Digest</option>
                        <option value="daily">Daily Digest</option>
                        <option value="weekly">Weekly Digest</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Security Settings
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Minimum Password Length
                        </label>
                        <input
                          type="number"
                          min="6"
                          max="20"
                          value={settings.security.passwordMinLength}
                          onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="480"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Login Attempts
                        </label>
                        <input
                          type="number"
                          min="3"
                          max="10"
                          value={settings.security.maxLoginAttempts}
                          onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Require Special Characters
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Passwords must contain special characters
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.security.requireSpecialChars}
                          onChange={(e) => handleSettingChange('security', 'requireSpecialChars', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Two-Factor Authentication
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enable 2FA for admin accounts
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Auto Logout
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Automatically logout inactive users
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.security.autoLogout}
                          onChange={(e) => handleSettingChange('security', 'autoLogout', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>
                    </div>

                    {/* Admin Password Settings */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                        Admin Password Settings
                      </h4>
                      <div className="max-w-md">
                        <PasswordUpdate
                          userType="admin"
                          userId="admin-1"
                          userEmail="admin@sunx.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Settings */}
                {activeTab === 'payments' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Payment Settings
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Minimum Payment Amount
                        </label>
                        <input
                          type="number"
                          min="100"
                          value={settings.payments.minPaymentAmount}
                          onChange={(e) => handleSettingChange('payments', 'minPaymentAmount', parseInt(e.target.value))}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Maximum Payment Amount
                        </label>
                        <input
                          type="number"
                          min="1000"
                          value={settings.payments.maxPaymentAmount}
                          onChange={(e) => handleSettingChange('payments', 'maxPaymentAmount', parseInt(e.target.value))}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Auto-Approval Threshold
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={settings.payments.approvalThreshold}
                          onChange={(e) => handleSettingChange('payments', 'approvalThreshold', parseInt(e.target.value))}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Processing Fee (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={settings.payments.processingFee}
                          onChange={(e) => handleSettingChange('payments', 'processingFee', parseFloat(e.target.value))}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Auto-Approval
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Automatically approve payments below threshold
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.payments.autoApproval}
                        onChange={(e) => handleSettingChange('payments', 'autoApproval', e.target.checked)}
                        className="form-checkbox"
                      />
                    </div>
                  </div>
                )}

                {/* System Settings */}
                {activeTab === 'system' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      System Settings
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Log Level
                        </label>
                        <select
                          value={settings.system.logLevel}
                          onChange={(e) => handleSettingChange('system', 'logLevel', e.target.value)}
                          className="form-select"
                        >
                          <option value="error">Error</option>
                          <option value="warn">Warning</option>
                          <option value="info">Info</option>
                          <option value="debug">Debug</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Backup Frequency
                        </label>
                        <select
                          value={settings.system.backupFrequency}
                          onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
                          className="form-select"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Data Retention (days)
                        </label>
                        <input
                          type="number"
                          min="30"
                          max="3650"
                          value={settings.system.dataRetention}
                          onChange={(e) => handleSettingChange('system', 'dataRetention', parseInt(e.target.value))}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Maintenance Mode
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Put system in maintenance mode
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.system.maintenanceMode}
                          onChange={(e) => handleSettingChange('system', 'maintenanceMode', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Debug Mode
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enable debug logging and error details
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.system.debugMode}
                          onChange={(e) => handleSettingChange('system', 'debugMode', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Cache Enabled
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enable system caching for better performance
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.system.cacheEnabled}
                          onChange={(e) => handleSettingChange('system', 'cacheEnabled', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Compression Enabled
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enable response compression
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.system.compressionEnabled}
                          onChange={(e) => handleSettingChange('system', 'compressionEnabled', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
