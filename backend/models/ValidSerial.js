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

// Static method to check if serial number is valid (approved)
validSerialSchema.statics.isSerialValid = async function(serialNumber) {
  const validSerial = await this.findOne({ 
    serialNumber: serialNumber.toUpperCase(),
    isUsed: false
  });
  return !!validSerial;
};

// Static method to mark serial as used
validSerialSchema.statics.markAsUsed = async function(serialNumber, installerId) {
  const result = await this.findOneAndUpdate(
    { 
      serialNumber: serialNumber.toUpperCase(),
      isUsed: false
    },
    {
      isUsed: true,
      usedBy: installerId,
      usedAt: new Date()
    },
    { new: true }
  );
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
