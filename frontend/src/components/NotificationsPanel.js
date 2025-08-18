import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  GiftIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { installerService } from '../services/installerService';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const NotificationsPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await installerService.getNotifications();
      console.log('Notifications response:', response);

      // Handle the response structure
      const notificationsList = response.data?.notifications || response.notifications || response;
      setNotifications(Array.isArray(notificationsList) ? notificationsList : []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await installerService.markNotificationAsRead(notificationId);
      console.log('Mark as read response:', response);

      setNotifications(prev => prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      console.log('Marking all as read:', unreadIds);

      await Promise.all(unreadIds.map(id => installerService.markNotificationAsRead(id)));
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_approved':
      case 'payment_paid':
      case 'payment_rejected':
        return CurrencyDollarIcon;
      case 'promotion_created':
      case 'promotion_reward':
        return GiftIcon;
      case 'comment_added':
        return ChatBubbleLeftRightIcon;
      case 'system_alert':
        return ExclamationTriangleIcon;
      default:
        return BellIcon;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment_approved':
      case 'payment_paid':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'payment_rejected':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'promotion_created':
      case 'promotion_reward':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'comment_added':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'system_alert':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return formatDate(timestamp);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                <BellIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'read', label: 'Read', count: notifications.length - unreadCount }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === 'unread' ? 'No unread notifications' : 
                   filter === 'read' ? 'No read notifications' : 'No notifications yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  const colorClasses = getNotificationColor(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        !notification.read ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Notification Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>

                        {/* Notification Content */}
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
                                  onClick={() => markAsRead(notification.id)}
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
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </p>
            
            <button
              onClick={onClose}
              className="btn-outline"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
