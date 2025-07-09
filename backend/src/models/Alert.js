import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  // Alert Identification
  alertId: {
    type: String,
    required: [true, 'Alert ID is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Alert ID cannot exceed 50 characters']
  },
  
  // Alert Type and Category
  type: {
    type: String,
    required: [true, 'Alert type is required'],
    enum: {
      values: [
        'vehicle', 'driver', 'trip', 'maintenance', 'fuel', 'safety', 
        'security', 'system', 'compliance', 'performance', 'other'
      ],
      message: 'Invalid alert type'
    }
  },
  subType: {
    type: String,
    required: [true, 'Alert subtype is required'],
    enum: {
      values: [
        // Vehicle alerts
        'vehicle-breakdown', 'vehicle-accident', 'vehicle-theft', 'vehicle-maintenance-due',
        'vehicle-inspection-due', 'vehicle-registration-expiry', 'vehicle-insurance-expiry',
        
        // Driver alerts
        'driver-license-expiry', 'driver-medical-expiry', 'driver-violation', 'driver-absence',
        'driver-overtime', 'driver-fatigue', 'driver-performance',
        
        // Trip alerts
        'trip-delay', 'trip-route-deviation', 'trip-emergency', 'trip-completion',
        'trip-cancellation', 'trip-no-show',
        
        // Safety alerts
        'speeding', 'harsh-braking', 'harsh-acceleration', 'seatbelt', 'phone-usage',
        'drowsiness', 'distraction',
        
        // Fuel alerts
        'low-fuel', 'fuel-theft', 'excessive-consumption', 'fuel-card-misuse',
        
        // System alerts
        'gps-offline', 'device-malfunction', 'communication-loss', 'battery-low',
        'system-error', 'data-sync-failure',
        
        // Other
        'geofence-entry', 'geofence-exit', 'unauthorized-usage', 'custom'
      ],
      message: 'Invalid alert subtype'
    }
  },
  
  // Severity and Priority
  severity: {
    type: String,
    required: [true, 'Alert severity is required'],
    enum: {
      values: ['info', 'low', 'medium', 'high', 'critical'],
      message: 'Severity must be one of: info, low, medium, high, critical'
    },
    default: 'medium'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'normal', 'high', 'urgent'],
      message: 'Priority must be one of: low, normal, high, urgent'
    },
    default: 'normal'
  },
  
  // Related Entities
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Alert Content
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [200, 'Alert title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true,
    maxlength: [1000, 'Alert message cannot exceed 1000 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Alert description cannot exceed 2000 characters']
  },
  
  // Alert Data
  data: {
    value: {
      type: mongoose.Schema.Types.Mixed // Can store any type of data
    },
    threshold: {
      type: mongoose.Schema.Types.Mixed
    },
    unit: {
      type: String,
      trim: true
    },
    location: {
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
      address: {
        type: String,
        trim: true
      }
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  
  // Status and Lifecycle
  status: {
    type: String,
    required: [true, 'Alert status is required'],
    enum: {
      values: ['active', 'acknowledged', 'resolved', 'dismissed', 'expired'],
      message: 'Status must be one of: active, acknowledged, resolved, dismissed, expired'
    },
    default: 'active'
  },
  
  // Acknowledgment
  acknowledgment: {
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
    },
    acknowledgmentNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Acknowledgment note cannot exceed 500 characters']
    }
  },
  
  // Resolution
  resolution: {
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    },
    resolutionNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution note cannot exceed 1000 characters']
    },
    resolutionAction: {
      type: String,
      enum: ['no-action', 'maintenance-scheduled', 'driver-contacted', 'trip-modified', 'policy-updated', 'other'],
      default: 'no-action'
    }
  },
  
  // Notification Settings
  notifications: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      },
      recipients: [{
        type: String,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address']
      }]
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      },
      recipients: [{
        type: String,
        match: [/^\+?[\d\s-()]+$/, 'Invalid phone number']
      }]
    },
    push: {
      enabled: {
        type: Boolean,
        default: true
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      }
    },
    dashboard: {
      enabled: {
        type: Boolean,
        default: true
      },
      displayed: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Escalation
  escalation: {
    enabled: {
      type: Boolean,
      default: false
    },
    level: {
      type: Number,
      default: 0,
      min: [0, 'Escalation level cannot be negative']
    },
    escalatedAt: {
      type: Date
    },
    escalatedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    maxLevel: {
      type: Number,
      default: 3,
      min: [1, 'Max escalation level must be at least 1']
    },
    intervalMinutes: {
      type: Number,
      default: 30,
      min: [1, 'Escalation interval must be at least 1 minute']
    }
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index
  },
  
  // Recurrence (for recurring alerts)
  recurrence: {
    enabled: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom']
    },
    interval: {
      type: Number,
      min: [1, 'Recurrence interval must be at least 1']
    },
    endDate: {
      type: Date
    },
    lastOccurrence: {
      type: Date
    },
    nextOccurrence: {
      type: Date
    }
  },
  
  // Metadata
  source: {
    type: String,
    enum: ['system', 'device', 'user', 'api', 'scheduled'],
    default: 'system'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Related Alerts
  relatedAlerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  }],
  parentAlert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  },
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Virtual for alert age
alertSchema.virtual('age').get(function() {
  return new Date() - this.createdAt;
});

// Virtual for time to acknowledgment
alertSchema.virtual('timeToAcknowledgment').get(function() {
  if (!this.acknowledgment.acknowledgedAt) return null;
  return this.acknowledgment.acknowledgedAt - this.createdAt;
});

// Virtual for time to resolution
alertSchema.virtual('timeToResolution').get(function() {
  if (!this.resolution.resolvedAt) return null;
  return this.resolution.resolvedAt - this.createdAt;
});

// Virtual for is expired
alertSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Indexes for performance
alertSchema.index({ alertId: 1 });
alertSchema.index({ type: 1, subType: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ vehicle: 1, createdAt: -1 });
alertSchema.index({ driver: 1, createdAt: -1 });
alertSchema.index({ trip: 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ 'acknowledgment.acknowledged': 1 });
alertSchema.index({ 'resolution.resolved': 1 });
alertSchema.index({ expiresAt: 1 });

// Pre-save middleware to generate alert ID
alertSchema.pre('save', function(next) {
  if (this.isNew && !this.alertId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.alertId = `ALT-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Static methods
alertSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ createdAt: -1 });
};

alertSchema.statics.findByVehicle = function(vehicleId, status = null) {
  const query = { vehicle: vehicleId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

alertSchema.statics.findByDriver = function(driverId, status = null) {
  const query = { driver: driverId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

alertSchema.statics.findBySeverity = function(severity) {
  return this.find({ severity: severity, status: 'active' }).sort({ createdAt: -1 });
};

alertSchema.statics.findUnacknowledged = function() {
  return this.find({ 
    status: 'active',
    'acknowledgment.acknowledged': false 
  }).sort({ createdAt: -1 });
};

alertSchema.statics.findUnresolved = function() {
  return this.find({ 
    status: { $in: ['active', 'acknowledged'] },
    'resolution.resolved': false 
  }).sort({ createdAt: -1 });
};

// Instance methods
alertSchema.methods.acknowledge = function(userId, note = '') {
  this.acknowledgment.acknowledged = true;
  this.acknowledgment.acknowledgedBy = userId;
  this.acknowledgment.acknowledgedAt = new Date();
  this.acknowledgment.acknowledgmentNote = note;
  this.status = 'acknowledged';
  this.updatedBy = userId;
  return this.save();
};

alertSchema.methods.resolve = function(userId, note = '', action = 'no-action') {
  this.resolution.resolved = true;
  this.resolution.resolvedBy = userId;
  this.resolution.resolvedAt = new Date();
  this.resolution.resolutionNote = note;
  this.resolution.resolutionAction = action;
  this.status = 'resolved';
  this.updatedBy = userId;
  return this.save();
};

alertSchema.methods.dismiss = function(userId) {
  this.status = 'dismissed';
  this.updatedBy = userId;
  return this.save();
};

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
