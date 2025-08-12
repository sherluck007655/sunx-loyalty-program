const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient Information
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Recipient ID is required']
  },
  recipientType: {
    type: String,
    enum: ['installer', 'admin'],
    required: [true, 'Recipient type is required']
  },
  
  // Notification Content
  type: {
    type: String,
    enum: [
      'payment_approved',
      'payment_paid', 
      'payment_rejected',
      'payment_comment',
      'promotion_created',
      'promotion_completed',
      'milestone_reached',
      'serial_approved',
      'serial_rejected',
      'system_announcement',
      'profile_update_required'
    ],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  
  // Status
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  
  // Additional Data (for navigation/context)
  data: {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion'
    },
    serialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SerialNumber'
    },
    installerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Installer'
    },
    amount: Number,
    installerName: String,
    actionUrl: String, // URL to navigate to when clicked
    metadata: mongoose.Schema.Types.Mixed // For any additional data
  },
  
  // Priority and Display
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date // Optional expiration date for temporary notifications
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipientId: 1, recipientType: 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Static method to create notification for installer
notificationSchema.statics.createForInstaller = async function(installerId, notificationData) {
  const notification = new this({
    recipientId: installerId,
    recipientType: 'installer',
    ...notificationData
  });
  
  return await notification.save();
};

// Static method to create notification for admin
notificationSchema.statics.createForAdmin = async function(adminId, notificationData) {
  const notification = new this({
    recipientId: adminId,
    recipientType: 'admin',
    ...notificationData
  });
  
  return await notification.save();
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function(recipientId, recipientType) {
  return await this.countDocuments({
    recipientId,
    recipientType,
    read: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return await this.save();
};

// Pre-save middleware to set readAt when read is set to true
notificationSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
