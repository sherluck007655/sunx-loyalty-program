const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  installer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Installer',
    required: [true, 'Installer reference is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'PKR',
    enum: ['PKR', 'USD', 'EUR']
  },
  paymentType: {
    type: String,
    enum: ['milestone', 'bonus', 'promotion', 'rebate', 'manual'],
    default: 'milestone'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'rejected', 'cancelled'],
    default: 'pending'
  },
  description: {
    type: String,
    required: [true, 'Payment description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  milestoneReached: {
    type: Number, // Number of inverters when payment was triggered
    required: function() {
      return this.paymentType === 'milestone';
    }
  },
  promotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
    required: function() {
      return this.paymentType === 'promotion';
    }
  },
  
  // Payment Processing Information
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cheque', 'cash', 'mobile_wallet'],
    default: 'bank_transfer'
  },
  bankDetails: {
    accountTitle: String,
    accountNumber: String,
    bankName: String,
    branchCode: String
  },
  
  // Admin Information
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: {
    type: Date
  },
  paidAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  rejectedAt: {
    type: Date
  },

  // Payment Processing
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },

  // Additional tracking fields
  requestedAt: {
    type: Date,
    default: Date.now
  },
  inverterCount: {
    type: Number, // Number of inverters at time of request
    required: function() {
      return this.paymentType === 'milestone' || this.paymentType === 'manual';
    }
  },

  // Comments and notes
  adminComments: [{
    comment: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Enhanced comments system for frontend compatibility
  comments: [{
    id: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'comments.userType'
    },
    userName: String,
    userType: {
      type: String,
      enum: ['admin', 'installer']
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Receipts for payment tracking
  receipts: [{
    id: String,
    fileName: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    fileSize: Number,
    fileType: String,
    fileUrl: String
  }],

  // Metadata
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Payment receipt/proof
  paymentProof: {
    receiptNumber: String,
    receiptImage: String, // URL to uploaded receipt image
    uploadedAt: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ installer: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentType: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ transactionId: 1 });

// Pre-save middleware to set timestamps
paymentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'approved' && !this.approvedAt) {
      this.approvedAt = new Date();
    }
    if (this.status === 'paid' && !this.paidAt) {
      this.paidAt = new Date();
    }
  }
  next();
});

// Static method to get installer's payment history
paymentSchema.statics.getInstallerPayments = async function(installerId) {
  return await this.find({ installer: installerId })
    .sort({ createdAt: -1 })
    .populate('installer', 'name email loyaltyCardId')
    .populate('promotionId', 'title description');
};

// Static method to get pending payments for admin
paymentSchema.statics.getPendingPayments = async function() {
  return await this.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .populate('installer', 'name email loyaltyCardId phone')
    .populate('promotionId', 'title description');
};

// Method to approve payment
paymentSchema.methods.approve = function(adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};

// Method to reject payment
paymentSchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.approvedBy = adminId;
  this.rejectionReason = reason;
  return this.save();
};

// Method to mark as paid
paymentSchema.methods.markAsPaid = function(transactionId) {
  this.status = 'paid';
  this.paidAt = new Date();
  if (transactionId) {
    this.transactionId = transactionId;
  }
  return this.save();
};

// Virtual for payment age
paymentSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Payment', paymentSchema);
