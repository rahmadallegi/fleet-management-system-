import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  // Trip Identification
  tripNumber: {
    type: String,
    required: [true, 'Trip number is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Trip number cannot exceed 50 characters']
  },
  
  // Assignment
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle assignment is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver assignment is required']
  },
  
  // Trip Details
  purpose: {
    type: String,
    required: [true, 'Trip purpose is required'],
    enum: {
      values: ['delivery', 'pickup', 'service', 'transport', 'maintenance', 'emergency', 'other'],
      message: 'Purpose must be one of: delivery, pickup, service, transport, maintenance, emergency, other'
    }
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'normal', 'high', 'urgent'],
      message: 'Priority must be one of: low, normal, high, urgent'
    },
    default: 'normal'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Route Information
  route: {
    origin: {
      address: {
        type: String,
        required: [true, 'Origin address is required'],
        trim: true,
        maxlength: [200, 'Origin address cannot exceed 200 characters']
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
    destination: {
      address: {
        type: String,
        required: [true, 'Destination address is required'],
        trim: true,
        maxlength: [200, 'Destination address cannot exceed 200 characters']
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
    waypoints: [{
      address: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Waypoint address cannot exceed 200 characters']
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
      },
      order: {
        type: Number,
        required: true,
        min: [1, 'Waypoint order must be at least 1']
      },
      estimatedArrival: {
        type: Date
      },
      actualArrival: {
        type: Date
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [200, 'Waypoint notes cannot exceed 200 characters']
      }
    }],
    plannedDistance: {
      value: {
        type: Number,
        min: [0, 'Planned distance cannot be negative']
      },
      unit: {
        type: String,
        enum: ['km', 'miles'],
        default: 'km'
      }
    },
    actualDistance: {
      value: {
        type: Number,
        min: [0, 'Actual distance cannot be negative']
      },
      unit: {
        type: String,
        enum: ['km', 'miles'],
        default: 'km'
      }
    }
  },
  
  // Timing
  schedule: {
    plannedStart: {
      type: Date,
      required: [true, 'Planned start time is required']
    },
    plannedEnd: {
      type: Date,
      required: [true, 'Planned end time is required'],
      validate: {
        validator: function(value) {
          return value > this.schedule.plannedStart;
        },
        message: 'Planned end time must be after planned start time'
      }
    },
    actualStart: {
      type: Date
    },
    actualEnd: {
      type: Date
    }
  },
  
  // Status Tracking
  status: {
    type: String,
    required: [true, 'Trip status is required'],
    enum: {
      values: ['planned', 'assigned', 'in-progress', 'completed', 'cancelled', 'delayed'],
      message: 'Status must be one of: planned, assigned, in-progress, completed, cancelled, delayed'
    },
    default: 'planned'
  },
  
  // Odometer Readings
  odometer: {
    start: {
      type: Number,
      min: [0, 'Start odometer reading cannot be negative']
    },
    end: {
      type: Number,
      min: [0, 'End odometer reading cannot be negative'],
      validate: {
        validator: function(value) {
          return !this.odometer.start || value >= this.odometer.start;
        },
        message: 'End odometer reading must be greater than or equal to start reading'
      }
    },
    unit: {
      type: String,
      enum: ['km', 'miles'],
      default: 'km'
    }
  },
  
  // Fuel Information
  fuel: {
    startLevel: {
      type: Number,
      min: [0, 'Start fuel level cannot be negative'],
      max: [100, 'Start fuel level cannot exceed 100%']
    },
    endLevel: {
      type: Number,
      min: [0, 'End fuel level cannot be negative'],
      max: [100, 'End fuel level cannot exceed 100%']
    },
    consumed: {
      amount: {
        type: Number,
        min: [0, 'Fuel consumed cannot be negative']
      },
      unit: {
        type: String,
        enum: ['liters', 'gallons'],
        default: 'liters'
      }
    },
    cost: {
      type: Number,
      min: [0, 'Fuel cost cannot be negative']
    }
  },
  
  // Cargo/Passenger Information
  cargo: {
    type: {
      type: String,
      enum: ['none', 'cargo', 'passengers', 'both'],
      default: 'none'
    },
    weight: {
      type: Number,
      min: [0, 'Cargo weight cannot be negative']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Cargo description cannot exceed 200 characters']
    },
    passengerCount: {
      type: Number,
      min: [0, 'Passenger count cannot be negative']
    }
  },
  
  // Weather Conditions
  weather: {
    condition: {
      type: String,
      enum: ['clear', 'cloudy', 'rainy', 'snowy', 'foggy', 'stormy', 'other']
    },
    temperature: {
      type: Number
    },
    visibility: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    }
  },
  
  // Incidents & Issues
  incidents: [{
    type: {
      type: String,
      enum: ['accident', 'breakdown', 'traffic', 'weather', 'cargo', 'other'],
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Incident description cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },
    location: {
      address: {
        type: String,
        trim: true
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
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Resolution notes cannot exceed 500 characters']
    }
  }],
  
  // Documents & Images
  documents: [{
    type: {
      type: String,
      enum: ['receipt', 'delivery-proof', 'inspection', 'incident-report', 'other'],
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
  
  // Trip Completion
  completion: {
    driverSignature: {
      type: String // Base64 encoded signature or URL
    },
    customerSignature: {
      type: String // Base64 encoded signature or URL
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5']
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [500, 'Feedback cannot exceed 500 characters']
    }
  },
  
  // Cost Tracking
  costs: {
    fuel: {
      type: Number,
      default: 0,
      min: [0, 'Fuel cost cannot be negative']
    },
    tolls: {
      type: Number,
      default: 0,
      min: [0, 'Toll cost cannot be negative']
    },
    parking: {
      type: Number,
      default: 0,
      min: [0, 'Parking cost cannot be negative']
    },
    other: {
      type: Number,
      default: 0,
      min: [0, 'Other costs cannot be negative']
    },
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total cost cannot be negative']
    }
  },
  
  // Notes
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

// Virtual for trip duration (planned)
tripSchema.virtual('plannedDuration').get(function() {
  if (!this.schedule.plannedStart || !this.schedule.plannedEnd) return null;
  return this.schedule.plannedEnd - this.schedule.plannedStart;
});

// Virtual for trip duration (actual)
tripSchema.virtual('actualDuration').get(function() {
  if (!this.schedule.actualStart || !this.schedule.actualEnd) return null;
  return this.schedule.actualEnd - this.schedule.actualStart;
});

// Virtual for distance traveled
tripSchema.virtual('distanceTraveled').get(function() {
  if (!this.odometer.start || !this.odometer.end) return null;
  return this.odometer.end - this.odometer.start;
});

// Virtual for trip efficiency
tripSchema.virtual('efficiency').get(function() {
  const distance = this.distanceTraveled;
  const fuelConsumed = this.fuel.consumed?.amount;
  if (!distance || !fuelConsumed || fuelConsumed === 0) return null;
  return distance / fuelConsumed; // km/l or miles/gallon
});

// Virtual for delay status
tripSchema.virtual('isDelayed').get(function() {
  if (this.status === 'completed' && this.schedule.actualEnd && this.schedule.plannedEnd) {
    return this.schedule.actualEnd > this.schedule.plannedEnd;
  }
  if (this.status === 'in-progress' && this.schedule.plannedEnd) {
    return new Date() > this.schedule.plannedEnd;
  }
  return false;
});

// Indexes for performance
tripSchema.index({ tripNumber: 1 });
tripSchema.index({ vehicle: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ 'schedule.plannedStart': 1 });
tripSchema.index({ 'schedule.plannedEnd': 1 });
tripSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total costs
tripSchema.pre('save', function(next) {
  this.costs.total = this.costs.fuel + this.costs.tolls + this.costs.parking + this.costs.other;
  next();
});

// Static methods
tripSchema.statics.findByStatus = function(status) {
  return this.find({ status: status });
};

tripSchema.statics.findByVehicle = function(vehicleId) {
  return this.find({ vehicle: vehicleId });
};

tripSchema.statics.findByDriver = function(driverId) {
  return this.find({ driver: driverId });
};

tripSchema.statics.findInProgress = function() {
  return this.find({ status: 'in-progress' });
};

tripSchema.statics.findDelayed = function() {
  const now = new Date();
  return this.find({
    status: { $in: ['in-progress', 'assigned'] },
    'schedule.plannedEnd': { $lt: now }
  });
};

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
