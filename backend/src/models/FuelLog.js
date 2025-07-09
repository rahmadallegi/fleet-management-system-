import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema({
  // Vehicle and Driver Information
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle reference is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver reference is required']
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null // Optional - fuel can be added outside of trips
  },
  
  // Fuel Transaction Details
  date: {
    type: Date,
    required: [true, 'Fuel date is required'],
    default: Date.now
  },
  time: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  
  // Location Information
  location: {
    stationName: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
      maxlength: [100, 'Station name cannot exceed 100 characters']
    },
    address: {
      type: String,
      required: [true, 'Station address is required'],
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  
  // Fuel Details
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: {
      values: ['gasoline', 'diesel', 'premium', 'lpg', 'cng', 'electric', 'other'],
      message: 'Fuel type must be one of: gasoline, diesel, premium, lpg, cng, electric, other'
    }
  },
  quantity: {
    amount: {
      type: Number,
      required: [true, 'Fuel quantity is required'],
      min: [0, 'Fuel quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Fuel unit is required'],
      enum: {
        values: ['liters', 'gallons', 'kwh'],
        message: 'Fuel unit must be one of: liters, gallons, kwh'
      }
    }
  },
  
  // Cost Information
  cost: {
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price per unit cannot be negative']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD',
      maxlength: [3, 'Currency code cannot exceed 3 characters']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    }
  },
  
  // Vehicle Status
  odometer: {
    reading: {
      type: Number,
      required: [true, 'Odometer reading is required'],
      min: [0, 'Odometer reading cannot be negative']
    },
    unit: {
      type: String,
      enum: ['km', 'miles'],
      default: 'km'
    }
  },
  fuelLevel: {
    before: {
      type: Number,
      min: [0, 'Fuel level before cannot be negative'],
      max: [100, 'Fuel level before cannot exceed 100%']
    },
    after: {
      type: Number,
      min: [0, 'Fuel level after cannot be negative'],
      max: [100, 'Fuel level after cannot exceed 100%']
    }
  },
  
  // Payment Information
  payment: {
    method: {
      type: String,
      enum: {
        values: ['cash', 'credit-card', 'debit-card', 'fuel-card', 'company-account', 'other'],
        message: 'Payment method must be one of: cash, credit-card, debit-card, fuel-card, company-account, other'
      },
      required: [true, 'Payment method is required']
    },
    cardNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Card number cannot exceed 20 characters']
    },
    receiptNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Receipt number cannot exceed 50 characters']
    },
    authorizationCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Authorization code cannot exceed 20 characters']
    }
  },
  
  // Fuel Efficiency Calculation
  efficiency: {
    distanceSinceLastFuel: {
      type: Number,
      min: [0, 'Distance cannot be negative']
    },
    fuelConsumed: {
      type: Number,
      min: [0, 'Fuel consumed cannot be negative']
    },
    mpg: {
      type: Number, // Miles per gallon
      min: [0, 'MPG cannot be negative']
    },
    kpl: {
      type: Number, // Kilometers per liter
      min: [0, 'KPL cannot be negative']
    }
  },
  
  // Quality and Condition
  fuelQuality: {
    octaneRating: {
      type: Number,
      min: [80, 'Octane rating must be at least 80'],
      max: [120, 'Octane rating cannot exceed 120']
    },
    additives: [{
      type: String,
      trim: true
    }],
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    }
  },
  
  // Environmental Impact
  emissions: {
    co2Produced: {
      type: Number, // in kg
      min: [0, 'CO2 produced cannot be negative']
    },
    carbonOffset: {
      type: Number, // in kg
      min: [0, 'Carbon offset cannot be negative']
    }
  },
  
  // Documentation
  receipt: {
    imageUrl: {
      type: String
    },
    uploadDate: {
      type: Date
    }
  },
  
  // Verification and Approval
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  
  // Reimbursement
  reimbursement: {
    requested: {
      type: Boolean,
      default: false
    },
    amount: {
      type: Number,
      min: [0, 'Reimbursement amount cannot be negative']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending'
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedAt: {
      type: Date
    }
  },
  
  // Notes and Comments
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
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

// Virtual for total cost including tax
fuelLogSchema.virtual('totalCostWithTax').get(function() {
  return this.cost.totalAmount + this.cost.tax - this.cost.discount;
});

// Virtual for cost per distance unit
fuelLogSchema.virtual('costPerKm').get(function() {
  if (!this.efficiency.distanceSinceLastFuel || this.efficiency.distanceSinceLastFuel === 0) return null;
  return this.cost.totalAmount / this.efficiency.distanceSinceLastFuel;
});

// Indexes for performance
fuelLogSchema.index({ vehicle: 1, date: -1 });
fuelLogSchema.index({ driver: 1, date: -1 });
fuelLogSchema.index({ trip: 1 });
fuelLogSchema.index({ date: -1 });
fuelLogSchema.index({ 'cost.totalAmount': -1 });
fuelLogSchema.index({ verified: 1 });
fuelLogSchema.index({ approved: 1 });

// Pre-save middleware to calculate efficiency
fuelLogSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('quantity.amount') || this.isModified('efficiency.distanceSinceLastFuel')) {
    if (this.efficiency.distanceSinceLastFuel && this.quantity.amount > 0) {
      // Calculate fuel efficiency
      if (this.quantity.unit === 'liters') {
        this.efficiency.kpl = this.efficiency.distanceSinceLastFuel / this.quantity.amount;
        this.efficiency.mpg = this.efficiency.kpl * 2.352; // Convert KPL to MPG
      } else if (this.quantity.unit === 'gallons') {
        this.efficiency.mpg = this.efficiency.distanceSinceLastFuel / this.quantity.amount;
        this.efficiency.kpl = this.efficiency.mpg / 2.352; // Convert MPG to KPL
      }
    }
  }
  next();
});

// Static methods
fuelLogSchema.statics.findByVehicle = function(vehicleId, startDate, endDate) {
  const query = { vehicle: vehicleId };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }
  return this.find(query).sort({ date: -1 });
};

fuelLogSchema.statics.findByDriver = function(driverId, startDate, endDate) {
  const query = { driver: driverId };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }
  return this.find(query).sort({ date: -1 });
};

fuelLogSchema.statics.getTotalCostByVehicle = function(vehicleId, startDate, endDate) {
  const matchStage = { vehicle: new mongoose.Types.ObjectId(vehicleId) };
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = startDate;
    if (endDate) matchStage.date.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    { $group: { _id: null, totalCost: { $sum: '$cost.totalAmount' }, totalQuantity: { $sum: '$quantity.amount' } } }
  ]);
};

fuelLogSchema.statics.getAverageEfficiency = function(vehicleId, startDate, endDate) {
  const matchStage = {
    vehicle: new mongoose.Types.ObjectId(vehicleId),
    'efficiency.kpl': { $exists: true, $gt: 0 }
  };
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = startDate;
    if (endDate) matchStage.date.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    { $group: { _id: null, avgKpl: { $avg: '$efficiency.kpl' }, avgMpg: { $avg: '$efficiency.mpg' } } }
  ]);
};

const FuelLog = mongoose.model('FuelLog', fuelLogSchema);

export default FuelLog;
