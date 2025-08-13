const mongoose = require('mongoose');

const serialNumberSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]{6,20}$/, 'Serial number must be 6-20 alphanumeric characters']
  },
  installer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Installer',
    required: [true, 'Installer reference is required']
  },

  // Product Information
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  pointsEarned: {
    type: Number,
    required: [true, 'Points earned is required'],
    min: [0, 'Points cannot be negative']
  },

  // Installation Details
  installationDate: {
    type: Date,
    required: [true, 'Installation date is required'],
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Installation date cannot be in the future'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  location: {
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Customer Information
  customerName: {
    type: String,
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerPhone: {
    type: String,
    trim: true,
    maxlength: [20, 'Customer phone cannot exceed 20 characters']
  },

  // Legacy fields (for backward compatibility)
  inverterModel: {
    type: String,
    trim: true
  },
  capacity: {
    type: String,
    trim: true
  },

  // Additional Information
  warrantyExpiry: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
serialNumberSchema.index({ serialNumber: 1 });
serialNumberSchema.index({ installer: 1 });
serialNumberSchema.index({ product: 1 });
serialNumberSchema.index({ installationDate: -1 });
serialNumberSchema.index({ status: 1 });

// Pre-save middleware to validate installation date
serialNumberSchema.pre('save', function(next) {
  if (this.installationDate > new Date()) {
    next(new Error('Installation date cannot be in the future'));
  }
  next();
});

// Static method to check if serial number exists
serialNumberSchema.statics.isSerialExists = async function(serialNumber) {
  const existing = await this.findOne({ serialNumber: serialNumber.toUpperCase() });
  return !!existing;
};

// Static method to get installer's serial numbers with product info
serialNumberSchema.statics.getInstallerSerials = async function(installerId) {
  return await this.find({ installer: installerId })
    .sort({ installationDate: -1 })
    .populate('installer', 'name email loyaltyCardId')
    .populate('product', 'name model type points');
};

// Static method to get installer's total points
serialNumberSchema.statics.getInstallerTotalPoints = async function(installerId) {
  const result = await this.aggregate([
    { $match: { installer: installerId } },
    { $group: { _id: null, totalPoints: { $sum: '$pointsEarned' } } }
  ]);
  return result[0]?.totalPoints || 0;
};

// Static method to get installer's product statistics
serialNumberSchema.statics.getInstallerProductStats = async function(installerId) {
  return await this.aggregate([
    { $match: { installer: installerId } },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    {
      $group: {
        _id: '$productInfo.type',
        count: { $sum: 1 },
        totalPoints: { $sum: '$pointsEarned' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Method to format serial number display with product info
serialNumberSchema.methods.getDisplayInfo = function() {
  return {
    id: this._id,
    serialNumber: this.serialNumber,
    installationDate: this.installationDate,
    status: this.status,
    location: this.location,
    pointsEarned: this.pointsEarned,
    customerName: this.customerName,
    customerPhone: this.customerPhone,
    // Legacy fields
    inverterModel: this.inverterModel,
    capacity: this.capacity,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('SerialNumber', serialNumberSchema);
