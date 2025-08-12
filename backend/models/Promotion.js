const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Promotion title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Promotion description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['milestone_bonus', 'monthly_target', 'seasonal', 'special_event'],
    required: [true, 'Promotion type is required']
  },
  
  // Promotion Conditions
  targetInverters: {
    type: Number,
    required: [true, 'Target number of inverters is required'],
    min: [1, 'Target must be at least 1 inverter']
  },
  bonusAmount: {
    type: Number,
    required: [true, 'Bonus amount is required'],
    min: [0, 'Bonus amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'PKR',
    enum: ['PKR', 'USD', 'EUR']
  },
  
  // Time Period
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(date) {
        return date > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  
  // Status and Visibility
  isActive: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  
  // Eligibility Criteria
  eligibilityCriteria: {
    minExistingInverters: {
      type: Number,
      default: 0
    },
    maxParticipants: {
      type: Number,
      default: null // null means unlimited
    },
    allowedRegions: [{
      type: String,
      trim: true
    }],
    excludedInstallers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Installer'
    }]
  },
  
  // Tracking
  participants: [{
    installer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Installer'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    currentProgress: {
      type: Number,
      default: 0
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  
  // Display Settings
  bannerImage: {
    type: String, // URL to banner image
    trim: true
  },
  priority: {
    type: Number,
    default: 1, // Higher number = higher priority for display
    min: 1,
    max: 10
  },
  
  // Admin Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
promotionSchema.index({ isActive: 1, isVisible: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ type: 1 });
promotionSchema.index({ priority: -1 });

// Virtual for checking if promotion is currently active
promotionSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Virtual for days remaining
promotionSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const timeDiff = this.endDate - now;
  return Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
});

// Static method to get active promotions
promotionSchema.statics.getActivePromotions = async function() {
  const now = new Date();
  return await this.find({
    isActive: true,
    isVisible: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ priority: -1, createdAt: -1 });
};

// Static method to get promotions for installer
promotionSchema.statics.getInstallerPromotions = async function(installerId) {
  const now = new Date();
  return await this.find({
    isActive: true,
    isVisible: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    'eligibilityCriteria.excludedInstallers': { $ne: installerId }
  }).sort({ priority: -1, createdAt: -1 });
};

// Method to add participant
promotionSchema.methods.addParticipant = function(installerId) {
  const existingParticipant = this.participants.find(
    p => p.installer.toString() === installerId.toString()
  );
  
  if (!existingParticipant) {
    this.participants.push({
      installer: installerId,
      joinedAt: new Date(),
      currentProgress: 0,
      isCompleted: false
    });
  }
  
  return this.save();
};

// Method to update participant progress
promotionSchema.methods.updateParticipantProgress = function(installerId, newProgress) {
  const participant = this.participants.find(
    p => p.installer.toString() === installerId.toString()
  );
  
  if (participant) {
    participant.currentProgress = newProgress;
    
    if (newProgress >= this.targetInverters && !participant.isCompleted) {
      participant.isCompleted = true;
      participant.completedAt = new Date();
    }
  }
  
  return this.save();
};

module.exports = mongoose.model('Promotion', promotionSchema);
