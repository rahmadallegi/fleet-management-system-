import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  // Basic Vehicle Information
  plateNumber: {
    type: String,
    required: [true, 'Plate number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Plate number cannot exceed 20 characters']
  },
  vin: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [17, 'VIN cannot exceed 17 characters'],
    sparse: true // Allow multiple null values but unique non-null values
  },
  
  // Vehicle Details
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true,
    maxlength: [50, 'Make cannot exceed 50 characters']
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters']
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  color: {
    type: String,
    trim: true,
    maxlength: [30, 'Color cannot exceed 30 characters']
  },
  
  // Vehicle Type & Category
  type: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: {
      values: ['car', 'truck', 'van', 'motorcycle', 'bus', 'trailer', 'other'],
      message: 'Vehicle type must be one of: car, truck, van, motorcycle, bus, trailer, other'
    }
  },
  category: {
    type: String,
    enum: {
      values: ['passenger', 'cargo', 'service', 'emergency', 'construction', 'other'],
      message: 'Category must be one of: passenger, cargo, service, emergency, construction, other'
    },
    default: 'passenger'
  },
  
  // Technical Specifications
  engine: {
    type: {
      type: String,
      enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'other'],
      default: 'gasoline'
    },
    displacement: {
      type: Number, // in liters
      min: [0, 'Engine displacement cannot be negative']
    },
    power: {
      type: Number, // in horsepower
      min: [0, 'Engine power cannot be negative']
    }
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic', 'cvt', 'other'],
    default: 'manual'
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: {
      values: ['gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng', 'other'],
      message: 'Fuel type must be one of: gasoline, diesel, electric, hybrid, lpg, cng, other'
    }
  },
  
  // Capacity & Dimensions
  capacity: {
    passengers: {
      type: Number,
      min: [0, 'Passenger capacity cannot be negative'],
      default: 0
    },
    cargo: {
      weight: {
        type: Number, // in kg
        min: [0, 'Cargo weight capacity cannot be negative']
      },
      volume: {
        type: Number, // in cubic meters
        min: [0, 'Cargo volume capacity cannot be negative']
      }
    }
  },
  
  // Status & Availability
  status: {
    type: String,
    required: [true, 'Vehicle status is required'],
    enum: {
      values: ['active', 'inactive', 'maintenance', 'repair', 'retired', 'sold'],
      message: 'Status must be one of: active, inactive, maintenance, repair, retired, sold'
    },
    default: 'active'
  },
  availability: {
    type: String,
    enum: {
      values: ['available', 'in-use', 'maintenance', 'out-of-service'],
      message: 'Availability must be one of: available, in-use, maintenance, out-of-service'
    },
    default: 'available'
  },
  
  // Assignment
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  
  // Purchase & Registration
  purchaseInfo: {
    date: {
      type: Date
    },
    price: {
      type: Number,
      min: [0, 'Purchase price cannot be negative']
    },
    dealer: {
      type: String,
      trim: true,
      maxlength: [100, 'Dealer name cannot exceed 100 characters']
    }
  },
  registration: {
    date: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    registrationNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Registration number cannot exceed 50 characters']
    }
  },
  
  // Insurance
  insurance: {
    provider: {
      type: String,
      trim: true,
      maxlength: [100, 'Insurance provider cannot exceed 100 characters']
    },
    policyNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Policy number cannot exceed 50 characters']
    },
    startDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    premium: {
      type: Number,
      min: [0, 'Insurance premium cannot be negative']
    }
  },
  
  // Mileage & Usage
  odometer: {
    current: {
      type: Number,
      default: 0,
      min: [0, 'Odometer reading cannot be negative']
    },
    unit: {
      type: String,
      enum: ['km', 'miles'],
      default: 'km'
    }
  },
  
  // GPS & Tracking
  gpsDevice: {
    installed: {
      type: Boolean,
      default: false
    },
    deviceId: {
      type: String,
      trim: true
    },
    lastLocation: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      },
      timestamp: {
        type: Date
      }
    }
  },
  
  // Documents & Images
  documents: [{
    type: {
      type: String,
      enum: ['registration', 'insurance', 'inspection', 'manual', 'other'],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  images: [{
    type: {
      type: String,
      enum: ['exterior', 'interior', 'damage', 'other'],
      default: 'exterior'
    },
    url: {
      type: String,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notes & Comments
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for vehicle display name
vehicleSchema.virtual('displayName').get(function() {
  return `${this.year} ${this.make} ${this.model} (${this.plateNumber})`;
});

// Virtual for age
vehicleSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Virtual for registration status
vehicleSchema.virtual('registrationStatus').get(function() {
  if (!this.registration.expiryDate) return 'unknown';
  const now = new Date();
  const expiryDate = new Date(this.registration.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring-soon';
  return 'valid';
});

// Virtual for insurance status
vehicleSchema.virtual('insuranceStatus').get(function() {
  if (!this.insurance.expiryDate) return 'unknown';
  const now = new Date();
  const expiryDate = new Date(this.insurance.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring-soon';
  return 'valid';
});

// Indexes for performance
vehicleSchema.index({ plateNumber: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ availability: 1 });
vehicleSchema.index({ assignedDriver: 1 });
vehicleSchema.index({ type: 1 });
vehicleSchema.index({ 'registration.expiryDate': 1 });
vehicleSchema.index({ 'insurance.expiryDate': 1 });

// Static methods
vehicleSchema.statics.findAvailable = function() {
  return this.find({ 
    status: 'active', 
    availability: 'available' 
  });
};

vehicleSchema.statics.findByType = function(type) {
  return this.find({ type: type });
};

vehicleSchema.statics.findExpiringDocuments = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    $or: [
      { 'registration.expiryDate': { $lte: futureDate } },
      { 'insurance.expiryDate': { $lte: futureDate } }
    ]
  });
};

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
