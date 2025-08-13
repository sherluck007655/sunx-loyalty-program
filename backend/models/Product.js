const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Product Identification
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  model: {
    type: String,
    required: [true, 'Product model is required'],
    trim: true,
    maxlength: [100, 'Product model cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Product type is required'],
    enum: ['inverter', 'battery', 'solar_panel', 'charge_controller', 'monitoring_system', 'accessories'],
    lowercase: true
  },
  
  // Product Specifications
  specifications: {
    capacity: {
      type: String,
      trim: true
    },
    voltage: {
      type: String,
      trim: true
    },
    power: {
      type: String,
      trim: true
    },
    efficiency: {
      type: String,
      trim: true
    },
    dimensions: {
      type: String,
      trim: true
    },
    weight: {
      type: String,
      trim: true
    }
  },
  
  // Points System
  points: {
    type: Number,
    required: [true, 'Points value is required'],
    min: [1, 'Points must be at least 1'],
    max: [10000, 'Points cannot exceed 10000']
  },
  pointsHistory: [{
    previousPoints: {
      type: Number,
      required: true
    },
    newPoints: {
      type: Number,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      maxlength: [500, 'Reason cannot exceed 500 characters']
    }
  }],
  
  // Serial Number Pattern
  serialPattern: {
    prefix: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [10, 'Serial prefix cannot exceed 10 characters']
    },
    length: {
      type: Number,
      min: [6, 'Serial number length must be at least 6'],
      max: [20, 'Serial number length cannot exceed 20'],
      default: 12
    },
    format: {
      type: String,
      trim: true,
      default: 'ALPHANUMERIC' // ALPHANUMERIC, NUMERIC, ALPHA
    }
  },
  
  // Product Status
  isActive: {
    type: Boolean,
    default: true
  },
  isDiscontinued: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  manufacturer: {
    type: String,
    trim: true,
    maxlength: [100, 'Manufacturer name cannot exceed 100 characters']
  },
  category: {
    type: String,
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  
  // Admin Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ type: 1, isActive: 1 });
productSchema.index({ model: 1, type: 1 });
productSchema.index({ 'serialPattern.prefix': 1 });
productSchema.index({ points: 1 });

// Virtual for full product name
productSchema.virtual('fullName').get(function() {
  return `${this.name} ${this.model}`;
});

// Static method to find product by serial number pattern
productSchema.statics.findBySerialNumber = async function(serialNumber) {
  const products = await this.find({ isActive: true });
  
  for (const product of products) {
    if (product.serialPattern.prefix) {
      if (serialNumber.toUpperCase().startsWith(product.serialPattern.prefix)) {
        return product;
      }
    }
  }
  
  // If no prefix match, try to find by length and format
  for (const product of products) {
    if (!product.serialPattern.prefix && 
        serialNumber.length === product.serialPattern.length) {
      return product;
    }
  }
  
  return null;
};

// Static method to get products by type
productSchema.statics.getByType = async function(type) {
  return await this.find({ 
    type: type.toLowerCase(), 
    isActive: true 
  }).sort({ name: 1, model: 1 });
};

// Static method to get all active products
productSchema.statics.getActiveProducts = async function() {
  return await this.find({ isActive: true })
    .sort({ type: 1, name: 1, model: 1 });
};

// Method to update points with history tracking
productSchema.methods.updatePoints = async function(newPoints, adminId, reason) {
  // Add to history
  this.pointsHistory.push({
    previousPoints: this.points,
    newPoints: newPoints,
    changedBy: adminId,
    reason: reason || 'Points updated'
  });
  
  // Update current points
  this.points = newPoints;
  this.updatedBy = adminId;
  
  return await this.save();
};

// Method to get formatted display info
productSchema.methods.getDisplayInfo = function() {
  return {
    id: this._id,
    name: this.name,
    model: this.model,
    type: this.type,
    fullName: this.fullName,
    points: this.points,
    specifications: this.specifications,
    isActive: this.isActive,
    serialPattern: this.serialPattern
  };
};

// Pre-save middleware to ensure uppercase serial prefix
productSchema.pre('save', function(next) {
  if (this.serialPattern && this.serialPattern.prefix) {
    this.serialPattern.prefix = this.serialPattern.prefix.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
