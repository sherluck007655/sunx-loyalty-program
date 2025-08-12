import React, { useState, useEffect, useRef } from 'react';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  BoltIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { adminNotificationService } from '../services/adminNotificationService';
import { formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminNotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    
    // Listen for new notifications
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      toast.success(`New notification: ${notification.title}`, {
        duration: 4000,
        position: 'top-right'
      });
    };

    const handleNotificationRead = () => {
      loadNotifications();
    };

    adminNotificationService.on('notification_added', handleNewNotification);
    adminNotificationService.on('notification_read', handleNotificationRead);
    adminNotificationService.on('all_notifications_read', handleNotificationRead);

    return () => {
      adminNotificationService.off('notification_added', handleNewNotification);
      adminNotificationService.off('notification_read', handleNotificationRead);
      adminNotificationService.off('all_notifications_read', handleNotificationRead);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notificationsList = await adminNotificationService.getNotifications();
      setNotifications(notificationsList);
      setUnreadCount(adminNotificationService.getUnreadCount());
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await adminNotificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminNotificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      handleMarkAsRead(notification.id, { stopPropagation: () => {} });
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'new_message':
        navigate('/chat');
        break;
      case 'payment_request':
      case 'payment_comment':
        navigate('/admin/payments');
        break;
      case 'serial_submission':
        navigate('/admin/serials');
        break;
      case 'new_installer':
        navigate('/admin/installers');
        break;
      default:
        break;
    }
    
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return ChatBubbleLeftRightIcon;
      case 'payment_request':
        return CurrencyDollarIcon;
      case 'payment_comment':
        return ChatBubbleLeftRightIcon;
      case 'serial_submission':
        return BoltIcon;
      case 'new_installer':
        return UserPlusIcon;
      default:
        return ExclamationTriangleIcon;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_message':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'payment_request':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'payment_comment':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'serial_submission':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'new_installer':
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(timestamp);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Notifications
            </h3>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.slice(0, 10).map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  const colorClasses = getNotificationColor(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClasses}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium truncate ${
                              !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {getTimeAgo(notification.createdAt)}
                              </span>
                              
                              {!notification.read && (
                                <button
                                  onClick={(e) => handleMarkAsRead(notification.id, e)}
                                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                  title="Mark as read"
                                >
                                  <CheckIcon className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <p className={`text-sm mt-1 truncate ${
                            !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {notification.message}
                          </p>
                          
                          {/* Unread Indicator */}
                          {!notification.read && (
                            <div className="flex items-center mt-2">
                              <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                              <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                                New
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
            <button
              onClick={() => {
                navigate('/admin/notifications');
                setIsOpen(false);
              }}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;
