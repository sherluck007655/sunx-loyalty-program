// Initial admin notifications (used only if localStorage is empty)
const initialAdminNotifications = [
  {
    id: 'admin-notif-2',
    recipientId: 'admin',
    recipientType: 'admin',
    type: 'payment_request',
    title: 'New Payment Request',
    message: 'Test User submitted a payment request for PKR 5,000',
    data: {
      paymentId: 'payment-demo-3',
      amount: 5000,
      installerName: 'Test User',
      fromInstaller: true
    },
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'admin-notif-3',
    recipientId: 'admin',
    recipientType: 'admin',
    type: 'serial_submission',
    title: 'New Serial Number Submitted',
    message: 'John Doe submitted serial number SX987654321',
    data: {
      serialNumber: 'SX987654321',
      installerName: 'John Doe',
      inverterModel: 'SunX Pro 5kW',
      fromInstaller: true
    },
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
  },
  {
    id: 'admin-notif-4',
    recipientId: 'admin',
    recipientType: 'admin',
    type: 'new_installer',
    title: 'New Installer Registration',
    message: 'Ahmad Ali registered as a new installer',
    data: {
      installerId: 'installer-3',
      installerName: 'Ahmad Ali',
      city: 'Lahore',
      fromInstaller: true
    },
    read: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  },
  {
    id: 'admin-notif-5',
    recipientId: 'admin',
    recipientType: 'admin',
    type: 'payment_comment',
    title: 'New Payment Comment',
    message: 'Test User added a comment: "I have uploaded the payment receipt. Please check."',
    data: {
      paymentId: 'payment-demo-1',
      installerName: 'Test User',
      comment: 'I have uploaded the payment receipt. Please check.',
      fromInstaller: true
    },
    read: true,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
  }
];

// Persistent storage helper
const persistentStorage = {
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  load: (key, defaultValue = []) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  }
};

class AdminNotificationService {
  constructor() {
    this.eventListeners = new Map();
    this.storageKey = 'sunx_admin_notifications';
    this.initializeNotifications();
  }

  initializeNotifications() {
    // Load notifications from localStorage or use initial data
    this.notifications = persistentStorage.load(this.storageKey, initialAdminNotifications);
  }

  // Save notifications to localStorage
  saveToStorage() {
    persistentStorage.save(this.storageKey, this.notifications);
  }

  // Get all notifications for admin
  async getNotifications() {
    try {
      // Sort by creation date, newest first
      return this.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      throw error;
    }
  }

  // Add new notification
  addNotification(notification) {
    const newNotification = {
      id: `admin-notif-${Date.now()}`,
      recipientId: 'admin',
      recipientType: 'admin',
      read: false,
      createdAt: new Date().toISOString(),
      ...notification
    };

    this.notifications.unshift(newNotification);
    this.saveToStorage(); // Save to localStorage
    this.emit('notification_added', newNotification);

    return newNotification;
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        this.saveToStorage(); // Save to localStorage
        this.emit('notification_read', notification);
      }
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      this.notifications.forEach(notification => {
        notification.read = true;
      });
      this.saveToStorage(); // Save to localStorage
      this.emit('all_notifications_read');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Add chat message notification (only for installer messages)
  addChatNotification(message) {
    // STRICT CHECK: Only create notifications for messages FROM installers TO admin
    // Prevent any admin self-notifications
    if (message.senderType === 'installer' &&
        message.senderName &&
        !message.senderName.toLowerCase().includes('admin') &&
        !message.senderName.toLowerCase().includes('support')) {

      console.log('Creating chat notification for installer message:', {
        senderType: message.senderType,
        senderName: message.senderName,
        message: message.message
      });

      this.addNotification({
        type: 'new_message',
        title: `New Message from ${message.senderName}`,
        message: message.message.length > 50 ? message.message.substring(0, 50) + '...' : message.message,
        data: {
          senderId: message.senderId,
          senderName: message.senderName,
          chatId: message.chatId,
          fromInstaller: true
        }
      });
    } else {
      console.log('Skipping notification for non-installer message:', {
        senderType: message.senderType,
        senderName: message.senderName
      });
    }
  }

  // Add payment request notification
  addPaymentRequestNotification(paymentData) {
    this.addNotification({
      type: 'payment_request',
      title: 'New Payment Request',
      message: `${paymentData.installerName} submitted a payment request for PKR ${paymentData.amount.toLocaleString()}`,
      data: {
        paymentId: paymentData.paymentId,
        amount: paymentData.amount,
        installerName: paymentData.installerName,
        fromInstaller: true
      }
    });
  }

  // Add payment comment notification
  addPaymentCommentNotification(commentData) {
    // Only create notifications for installer comments, not admin comments
    if (commentData.userType === 'installer') {
      this.addNotification({
        type: 'payment_comment',
        title: 'New Payment Comment',
        message: `${commentData.userName} added a comment: "${commentData.comment.length > 50 ? commentData.comment.substring(0, 50) + '...' : commentData.comment}"`,
        data: {
          paymentId: commentData.paymentId,
          installerName: commentData.userName,
          comment: commentData.comment,
          fromInstaller: true
        }
      });
    }
  }

  // Add serial submission notification
  addSerialSubmissionNotification(serialData) {
    this.addNotification({
      type: 'serial_submission',
      title: 'New Serial Number Submitted',
      message: `${serialData.installerName} submitted serial number ${serialData.serialNumber}`,
      data: {
        serialNumber: serialData.serialNumber,
        installerName: serialData.installerName,
        inverterModel: serialData.inverterModel,
        fromInstaller: true
      }
    });
  }

  // Event handling
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Reset notifications to initial state (for testing/debugging)
  resetNotifications() {
    this.notifications = [...initialAdminNotifications];
    this.saveToStorage();
    console.log('🔄 Admin notifications reset to initial state');
  }

  // Clear all notifications
  clearAllNotifications() {
    this.notifications = [];
    this.saveToStorage();
    console.log('🗑️ All admin notifications cleared');
  }

  // Cleanup
  cleanup() {
    this.eventListeners.clear();
  }
}

export const adminNotificationService = new AdminNotificationService();
