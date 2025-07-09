import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  // Associated Trip and Vehicle
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'Trip reference is required']
  },
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
  
  // GPS Coordinates
  coordinates: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    altitude: {
      type: Number, // in meters
      default: null
    },
    accuracy: {
      type: Number, // in meters
      min: [0, 'Accuracy cannot be negative']
    }
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    required: [true, 'Timestamp is required'],
    default: Date.now,
    index: true
  },
  
  // Speed and Direction
  speed: {
    value: {
      type: Number,
      min: [0, 'Speed cannot be negative']
    },
    unit: {
      type: String,
      enum: ['kmh', 'mph', 'ms'],
      default: 'kmh'
    }
  },
  heading: {
    type: Number, // in degrees (0-360)
    min: [0, 'Heading must be between 0 and 360'],
    max: [360, 'Heading must be between 0 and 360']
  },
  
  // Address Information (reverse geocoded)
  address: {
    formatted: {
      type: String,
      trim: true
    },
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    }
  },
  
  // Location Type
  locationType: {
    type: String,
    enum: {
      values: ['start', 'waypoint', 'destination', 'tracking', 'stop', 'incident', 'fuel', 'other'],
      message: 'Location type must be one of: start, waypoint, destination, tracking, stop, incident, fuel, other'
    },
    default: 'tracking'
  },
  
  // Vehicle Status at this location
  vehicleStatus: {
    ignition: {
      type: Boolean,
      default: null
    },
    engine: {
      type: Boolean,
      default: null
    },
    doors: {
      type: String,
      enum: ['open', 'closed', 'unknown'],
      default: 'unknown'
    },
    fuel: {
      level: {
        type: Number,
        min: [0, 'Fuel level cannot be negative'],
        max: [100, 'Fuel level cannot exceed 100%']
      },
      unit: {
        type: String,
        enum: ['percentage', 'liters', 'gallons'],
        default: 'percentage'
      }
    },
    odometer: {
      reading: {
        type: Number,
        min: [0, 'Odometer reading cannot be negative']
      },
      unit: {
        type: String,
        enum: ['km', 'miles'],
        default: 'km'
      }
    }
  },
  
  // Environmental Data
  environment: {
    temperature: {
      type: Number // in Celsius
    },
    humidity: {
      type: Number,
      min: [0, 'Humidity cannot be negative'],
      max: [100, 'Humidity cannot exceed 100%']
    },
    weather: {
      type: String,
      enum: ['clear', 'cloudy', 'rainy', 'snowy', 'foggy', 'stormy', 'unknown'],
      default: 'unknown'
    }
  },
  
  // Geofence Information
  geofences: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['depot', 'customer', 'fuel-station', 'service-center', 'restricted', 'other'],
      required: true
    },
    event: {
      type: String,
      enum: ['enter', 'exit'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Alerts and Events
  alerts: [{
    type: {
      type: String,
      enum: ['speeding', 'harsh-braking', 'harsh-acceleration', 'idle-time', 'route-deviation', 'panic', 'other'],
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Alert description cannot exceed 200 characters']
    },
    value: {
      type: Number // For alerts with numeric values (e.g., speed)
    },
    threshold: {
      type: Number // The threshold that was exceeded
    },
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: {
      type: Date
    }
  }],
  
  // Data Source
  source: {
    device: {
      type: String,
      trim: true,
      maxlength: [50, 'Device name cannot exceed 50 characters']
    },
    deviceId: {
      type: String,
      trim: true,
      maxlength: [50, 'Device ID cannot exceed 50 characters']
    },
    provider: {
      type: String,
      trim: true,
      maxlength: [50, 'Provider name cannot exceed 50 characters']
    },
    signalStrength: {
      type: Number,
      min: [0, 'Signal strength cannot be negative'],
      max: [100, 'Signal strength cannot exceed 100%']
    }
  },
  
  // Data Quality
  quality: {
    gpsQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    satelliteCount: {
      type: Number,
      min: [0, 'Satellite count cannot be negative']
    },
    hdop: {
      type: Number, // Horizontal Dilution of Precision
      min: [0, 'HDOP cannot be negative']
    }
  },
  
  // Processing Status
  processed: {
    type: Boolean,
    default: false
  },
  processedAt: {
    type: Date
  },
  
  // Notes
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
locationSchema.index({ trip: 1, timestamp: 1 });
locationSchema.index({ vehicle: 1, timestamp: -1 });
locationSchema.index({ driver: 1, timestamp: -1 });
locationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
locationSchema.index({ timestamp: -1 });
locationSchema.index({ locationType: 1 });

// Geospatial index for location-based queries
locationSchema.index({ 
  'coordinates.latitude': '2dsphere',
  'coordinates.longitude': '2dsphere'
});

// Virtual for coordinate array (useful for mapping libraries)
locationSchema.virtual('coordinateArray').get(function() {
  return [this.coordinates.longitude, this.coordinates.latitude];
});

// Virtual for GeoJSON point
locationSchema.virtual('geoJson').get(function() {
  return {
    type: 'Point',
    coordinates: [this.coordinates.longitude, this.coordinates.latitude]
  };
});

// Static methods
locationSchema.statics.findByTrip = function(tripId, limit = 100) {
  return this.find({ trip: tripId })
    .sort({ timestamp: 1 })
    .limit(limit);
};

locationSchema.statics.findByVehicle = function(vehicleId, startDate, endDate) {
  const query = { vehicle: vehicleId };
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  return this.find(query).sort({ timestamp: -1 });
};

locationSchema.statics.findLatestByVehicle = function(vehicleId) {
  return this.findOne({ vehicle: vehicleId })
    .sort({ timestamp: -1 });
};

locationSchema.statics.findInRadius = function(latitude, longitude, radiusInMeters) {
  return this.find({
    'coordinates.latitude': {
      $gte: latitude - (radiusInMeters / 111320),
      $lte: latitude + (radiusInMeters / 111320)
    },
    'coordinates.longitude': {
      $gte: longitude - (radiusInMeters / (111320 * Math.cos(latitude * Math.PI / 180))),
      $lte: longitude + (radiusInMeters / (111320 * Math.cos(latitude * Math.PI / 180)))
    }
  });
};

locationSchema.statics.findWithAlerts = function(alertType = null) {
  const query = { 'alerts.0': { $exists: true } };
  if (alertType) {
    query['alerts.type'] = alertType;
  }
  return this.find(query).sort({ timestamp: -1 });
};

// Instance methods
locationSchema.methods.calculateDistanceFrom = function(otherLocation) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (otherLocation.coordinates.latitude - this.coordinates.latitude) * Math.PI / 180;
  const dLon = (otherLocation.coordinates.longitude - this.coordinates.longitude) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.coordinates.latitude * Math.PI / 180) * Math.cos(otherLocation.coordinates.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const Location = mongoose.model('Location', locationSchema);

export default Location;
