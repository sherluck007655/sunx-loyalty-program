import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  BoltIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { adminNotificationService } from '../../services/adminNotificationService';
import { formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const notificationTypes = [
    { value: 'all', label: 'All Notifications' },
    { value: 'new_message', label: 'Messages' },
    { value: 'payment_request', label: 'Payment Requests' },
    { value: 'payment_comment', label: 'Payment Comments' },
    { value: 'serial_submission', label: 'Serial Submissions' },
    { value: 'new_installer', label: 'New Installers' }
  ];

  useEffect(() => {
    loadNotifications();
    
    // Listen for new notifications
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
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

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notificationsList = await adminNotificationService.getNotifications();
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await adminNotificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminNotificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      handleMarkAsRead(notification.id);
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

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.type === filter;
    const matchesSearch = searchTerm === '' || 
                         notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout title="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn-primary"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Mark All Read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Type
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="form-select"
                >
                  {notificationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="card">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Notifications ({filteredNotifications.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filter !== 'all' ? 'No notifications found for the selected filters' : 'No notifications yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  const colorClasses = getNotificationColor(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex items-start space-x-4 p-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-primary-500' : 'bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                title="Mark as read"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <p className={`text-sm mt-1 ${
                          !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(notification.createdAt)}
                          </span>
                          
                          {!notification.read && (
                            <div className="flex items-center">
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
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
