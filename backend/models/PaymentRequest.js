const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
  installer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Installer',
    required: [true, 'Installer reference is required']
  },
  
  // Points and Amount Information
  pointsRequested: {
    type: Number,
    required: [true, 'Points requested is required'],
    min: [1000, 'Minimum 1000 points required for payment']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  pointValue: {
    type: Number,
    required: [true, 'Point value is required'],
    default: 50 // PKR 50 per point
  },
  currency: {
    type: String,
    default: 'PKR',
    enum: ['PKR', 'USD', 'EUR']
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvedDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  rejectedDate: {
    type: Date
  },
  
  // Admin Information
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  
  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'check'],
    default: 'bank_transfer'
  },
  transactionId: {
    type: String,
    trim: true
  },
  
  // Serial Numbers included in this payment (for tracking)
  serialNumbers: [{
    serialNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SerialNumber'
    },
    points: {
      type: Number,
      required: true
    }
  }],
  
  // Installer's available points at time of request
  availablePointsAtRequest: {
    type: Number,
    required: true
  },
  
  // Bank details at time of request
  bankDetails: {
    accountTitle: String,
    accountNumber: String,
    bankName: String,
    branchCode: String,
    iban: String
  },
  
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentRequestSchema.index({ installer: 1 });
paymentRequestSchema.index({ status: 1 });
paymentRequestSchema.index({ requestDate: -1 });
paymentRequestSchema.index({ pointsRequested: 1 });

// Pre-save middleware to calculate amount
paymentRequestSchema.pre('save', function(next) {
  if (this.isModified('pointsRequested') || this.isModified('pointValue')) {
    this.amount = this.pointsRequested * this.pointValue;
  }
  
  // Set status dates
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'approved':
        if (!this.approvedDate) this.approvedDate = now;
        break;
      case 'rejected':
        if (!this.rejectedDate) this.rejectedDate = now;
        break;
      case 'completed':
        if (!this.completedDate) this.completedDate = now;
        break;
    }
  }
  
  next();
});

// Static method to get installer's payment requests
paymentRequestSchema.statics.getInstallerRequests = async function(installerId) {
  return await this.find({ installer: installerId })
    .sort({ requestDate: -1 })
    .populate('installer', 'name email loyaltyCardId')
    .populate('serialNumbers.serialNumber', 'serialNumber installationDate');
};

// Static method to get pending payment requests for admin
paymentRequestSchema.statics.getPendingRequests = async function() {
  return await this.find({ status: 'pending' })
    .sort({ requestDate: -1 })
    .populate('installer', 'name email loyaltyCardId phone');
};

// Static method to get installer's total paid amount
paymentRequestSchema.statics.getInstallerTotalPaid = async function(installerId) {
  const result = await this.aggregate([
    { 
      $match: { 
        installer: installerId, 
        status: 'completed' 
      } 
    },
    { 
      $group: { 
        _id: null, 
        totalAmount: { $sum: '$amount' },
        totalPoints: { $sum: '$pointsRequested' }
      } 
    }
  ]);
  return result[0] || { totalAmount: 0, totalPoints: 0 };
};

// Static method to get installer's pending payment amount
paymentRequestSchema.statics.getInstallerPendingAmount = async function(installerId) {
  const result = await this.aggregate([
    { 
      $match: { 
        installer: installerId, 
        status: { $in: ['pending', 'approved'] }
      } 
    },
    { 
      $group: { 
        _id: null, 
        totalAmount: { $sum: '$amount' },
        totalPoints: { $sum: '$pointsRequested' }
      } 
    }
  ]);
  return result[0] || { totalAmount: 0, totalPoints: 0 };
};

// Method to approve payment request
paymentRequestSchema.methods.approve = function(adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedDate = new Date();
  return this.save();
};

// Method to reject payment request
paymentRequestSchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.approvedBy = adminId;
  this.rejectionReason = reason;
  this.rejectedDate = new Date();
  return this.save();
};

// Method to mark as completed
paymentRequestSchema.methods.complete = function(transactionId) {
  this.status = 'completed';
  this.completedDate = new Date();
  if (transactionId) {
    this.transactionId = transactionId;
  }
  return this.save();
};

// Virtual for formatted amount
paymentRequestSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toLocaleString()}`;
});

// Virtual for request age in days
paymentRequestSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.requestDate) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);
