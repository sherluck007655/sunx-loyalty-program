const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const installerSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  cnic: {
    type: String,
    required: [true, 'CNIC is required'],
    unique: true,
    match: [/^\d{5}-\d{7}-\d{1}$/, 'Please enter a valid CNIC format (12345-1234567-1)']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },

  // Loyalty Program Information
  loyaltyCardId: {
    type: String,
    unique: true,
    required: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  totalInverters: {
    type: Number,
    default: 0
  },
  isEligibleForPayment: {
    type: Boolean,
    default: false
  },

  // Payment Information
  bankDetails: {
    accountTitle: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    bankName: {
      type: String,
      trim: true
    },
    branchCode: {
      type: String,
      trim: true
    }
  },

  // Status and Metadata
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Index for better query performance
installerSchema.index({ email: 1 });
installerSchema.index({ phone: 1 });
installerSchema.index({ loyaltyCardId: 1 });
installerSchema.index({ cnic: 1 });

// Pre-save middleware to hash password
installerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
installerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update points and check eligibility (updated for new system)
installerSchema.methods.updateProgress = async function() {
  // Get actual points from SerialNumber collection
  const SerialNumber = require('./SerialNumber');
  this.totalPoints = await SerialNumber.getInstallerTotalPoints(this._id);
  this.isEligibleForPayment = this.totalPoints >= 1000; // 1000 points minimum
  return this.save();
};

// Method to generate password reset token
installerSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (1 hour)
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

// Method to validate reset token
installerSchema.methods.validateResetToken = function(token) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return this.resetPasswordToken === hashedToken &&
         this.resetPasswordExpire > Date.now();
};

// Static method to generate unique loyalty card ID
installerSchema.statics.generateLoyaltyCardId = async function() {
  let nextNumber = 1;
  let loyaltyCardId;
  let exists = true;

  // Keep trying until we find an available ID
  while (exists) {
    const paddedNumber = String(nextNumber).padStart(6, '0');
    loyaltyCardId = `SUNX-${paddedNumber}`;

    // Check if this ID already exists
    const existingInstaller = await this.findOne({ loyaltyCardId });
    exists = !!existingInstaller;

    if (exists) {
      nextNumber++;
    }
  }

  return loyaltyCardId;
};

module.exports = mongoose.model('Installer', installerSchema);
