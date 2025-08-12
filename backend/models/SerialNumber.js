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
  inverterModel: {
    type: String,
    trim: true
  },
  capacity: {
    type: String,
    trim: true
  },
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

// Static method to get installer's serial numbers
serialNumberSchema.statics.getInstallerSerials = async function(installerId) {
  return await this.find({ installer: installerId })
    .sort({ installationDate: -1 })
    .populate('installer', 'name email loyaltyCardId');
};

// Method to format serial number display
serialNumberSchema.methods.getDisplayInfo = function() {
  return {
    id: this._id,
    serialNumber: this.serialNumber,
    installationDate: this.installationDate,
    status: this.status,
    location: this.location,
    inverterModel: this.inverterModel,
    capacity: this.capacity,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('SerialNumber', serialNumberSchema);
