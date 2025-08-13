const mongoose = require('mongoose');

const validSerialSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]{6,20}$/, 'Serial number must be 6-20 alphanumeric characters']
  },

  // Product Information
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },

  // Usage Tracking
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Installer',
    default: null
  },
  usedAt: {
    type: Date,
    default: null
  },

  // Points at time of registration (for historical accuracy)
  pointsAwarded: {
    type: Number,
    default: null // Will be set when serial is used
  },

  // Admin Information
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
validSerialSchema.index({ serialNumber: 1 });
validSerialSchema.index({ isUsed: 1 });
validSerialSchema.index({ addedBy: 1 });
validSerialSchema.index({ product: 1 });

// Static method to check if serial number is valid and get product info
validSerialSchema.statics.getSerialInfo = async function(serialNumber) {
  const validSerial = await this.findOne({
    serialNumber: serialNumber.toUpperCase(),
    isUsed: false
  }).populate('product');

  return validSerial;
};

// Static method to check if serial number is valid (approved)
validSerialSchema.statics.isSerialValid = async function(serialNumber) {
  const validSerial = await this.findOne({
    serialNumber: serialNumber.toUpperCase(),
    isUsed: false
  });
  return !!validSerial;
};

// Static method to mark serial as used with points tracking
validSerialSchema.statics.markAsUsed = async function(serialNumber, installerId) {
  // Get the serial with product info
  const validSerial = await this.findOne({
    serialNumber: serialNumber.toUpperCase(),
    isUsed: false
  }).populate('product');

  if (!validSerial) {
    return null;
  }

  // Update with current product points
  const result = await this.findOneAndUpdate(
    {
      serialNumber: serialNumber.toUpperCase(),
      isUsed: false
    },
    {
      isUsed: true,
      usedBy: installerId,
      usedAt: new Date(),
      pointsAwarded: validSerial.product.points // Store points at time of use
    },
    { new: true }
  ).populate('product');

  return result;
};

// Static method to get available serials count
validSerialSchema.statics.getAvailableCount = async function() {
  return await this.countDocuments({ isUsed: false });
};

// Static method to get used serials count
validSerialSchema.statics.getUsedCount = async function() {
  return await this.countDocuments({ isUsed: true });
};

// Method to format display info
validSerialSchema.methods.getDisplayInfo = function() {
  return {
    id: this._id,
    serialNumber: this.serialNumber,
    isUsed: this.isUsed,
    usedBy: this.usedBy,
    usedAt: this.usedAt,
    addedBy: this.addedBy,
    notes: this.notes,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('ValidSerial', validSerialSchema);
