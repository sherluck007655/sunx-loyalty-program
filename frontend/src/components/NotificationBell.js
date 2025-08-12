import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { installerService } from '../services/installerService';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await installerService.getNotifications(20);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await installerService.markNotificationAsRead(notificationId);

      // Update local state - use both _id and id for compatibility
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId || n.id === notificationId) ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await installerService.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_approved':
        return '✅';
      case 'payment_paid':
        return '💰';
      case 'payment_rejected':
        return '❌';
      case 'payment_comment':
        return '💬';
      case 'promotion_created':
        return '🎉';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment_approved':
      case 'payment_paid':
        return 'text-green-600';
      case 'payment_rejected':
        return 'text-red-600';
      case 'payment_comment':
        return 'text-blue-600';
      case 'promotion_created':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      const notificationId = notification._id || notification.id;
      handleMarkAsRead(notificationId);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'payment_approved':
      case 'payment_paid':
      case 'payment_rejected':
      case 'payment_comment':
        window.location.href = '/payments';
        break;
      case 'promotion_created':
        window.location.href = '/promotions';
        break;
      default:
        break;
    }

    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {loading ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <BellIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification._id || notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const notificationId = notification._id || notification.id;
                                handleMarkAsRead(notificationId);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Could navigate to a full notifications page
                }}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-700"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
