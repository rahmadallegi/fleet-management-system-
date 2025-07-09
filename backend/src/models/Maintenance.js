import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  // Vehicle Information
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle reference is required']
  },
  
  // Maintenance Details
  type: {
    type: String,
    required: [true, 'Maintenance type is required'],
    enum: {
      values: [
        'scheduled', 'preventive', 'corrective', 'emergency', 'inspection', 
        'oil-change', 'tire-rotation', 'brake-service', 'engine-service', 
        'transmission-service', 'electrical', 'bodywork', 'other'
      ],
      message: 'Invalid maintenance type'
    }
  },
  category: {
    type: String,
    enum: {
      values: ['engine', 'transmission', 'brakes', 'tires', 'electrical', 'body', 'interior', 'other'],
      message: 'Invalid maintenance category'
    },
    required: [true, 'Maintenance category is required']
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'normal', 'high', 'urgent', 'critical'],
      message: 'Priority must be one of: low, normal, high, urgent, critical'
    },
    default: 'normal'
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  estimatedDuration: {
    value: {
      type: Number,
      min: [0, 'Estimated duration cannot be negative']
    },
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'hours'
    }
  },
  
  // Status Tracking
  status: {
    type: String,
    required: [true, 'Maintenance status is required'],
    enum: {
      values: ['scheduled', 'in-progress', 'completed', 'cancelled', 'postponed', 'overdue'],
      message: 'Invalid maintenance status'
    },
    default: 'scheduled'
  },
  
  // Service Provider
  serviceProvider: {
    type: {
      type: String,
      enum: ['internal', 'external'],
      default: 'internal'
    },
    name: {
      type: String,
      required: [true, 'Service provider name is required'],
      trim: true,
      maxlength: [100, 'Service provider name cannot exceed 100 characters']
    },
    contact: {
      phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
      },
      address: {
        type: String,
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters']
      }
    },
    technician: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Technician name cannot exceed 100 characters']
      },
      certification: {
        type: String,
        trim: true,
        maxlength: [100, 'Certification cannot exceed 100 characters']
      }
    }
  },
  
  // Work Details
  workOrder: {
    number: {
      type: String,
      trim: true,
      maxlength: [50, 'Work order number cannot exceed 50 characters']
    },
    description: {
      type: String,
      required: [true, 'Work description is required'],
      trim: true,
      maxlength: [1000, 'Work description cannot exceed 1000 characters']
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [1000, 'Instructions cannot exceed 1000 characters']
    }
  },
  
  // Parts and Materials
  parts: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Part name cannot exceed 100 characters']
    },
    partNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Part number cannot exceed 50 characters']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitCost: {
      type: Number,
      required: true,
      min: [0, 'Unit cost cannot be negative']
    },
    totalCost: {
      type: Number,
      required: true,
      min: [0, 'Total cost cannot be negative']
    },
    supplier: {
      type: String,
      trim: true,
      maxlength: [100, 'Supplier name cannot exceed 100 characters']
    },
    warranty: {
      duration: {
        type: Number,
        min: [0, 'Warranty duration cannot be negative']
      },
      unit: {
        type: String,
        enum: ['days', 'months', 'years', 'km', 'miles'],
        default: 'months'
      }
    }
  }],
  
  // Labor
  labor: {
    hours: {
      type: Number,
      min: [0, 'Labor hours cannot be negative']
    },
    rate: {
      type: Number,
      min: [0, 'Labor rate cannot be negative']
    },
    cost: {
      type: Number,
      min: [0, 'Labor cost cannot be negative']
    }
  },
  
  // Cost Summary
  costs: {
    parts: {
      type: Number,
      default: 0,
      min: [0, 'Parts cost cannot be negative']
    },
    labor: {
      type: Number,
      default: 0,
      min: [0, 'Labor cost cannot be negative']
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
    },
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total cost cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      maxlength: [3, 'Currency code cannot exceed 3 characters']
    }
  },
  
  // Vehicle Condition
  vehicleCondition: {
    before: {
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
      },
      fuelLevel: {
        type: Number,
        min: [0, 'Fuel level cannot be negative'],
        max: [100, 'Fuel level cannot exceed 100%']
      },
      condition: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
        default: 'good'
      },
      issues: [{
        type: String,
        trim: true
      }]
    },
    after: {
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
      },
      fuelLevel: {
        type: Number,
        min: [0, 'Fuel level cannot be negative'],
        max: [100, 'Fuel level cannot exceed 100%']
      },
      condition: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
        default: 'good'
      },
      resolvedIssues: [{
        type: String,
        trim: true
      }],
      newIssues: [{
        type: String,
        trim: true
      }]
    }
  },
  
  // Actual Execution
  actualWork: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    duration: {
      value: {
        type: Number,
        min: [0, 'Duration cannot be negative']
      },
      unit: {
        type: String,
        enum: ['minutes', 'hours', 'days'],
        default: 'hours'
      }
    },
    workPerformed: {
      type: String,
      trim: true,
      maxlength: [1000, 'Work performed description cannot exceed 1000 characters']
    },
    findings: {
      type: String,
      trim: true,
      maxlength: [1000, 'Findings cannot exceed 1000 characters']
    },
    recommendations: {
      type: String,
      trim: true,
      maxlength: [1000, 'Recommendations cannot exceed 1000 characters']
    }
  },
  
  // Quality Control
  inspection: {
    performed: {
      type: Boolean,
      default: false
    },
    inspector: {
      type: String,
      trim: true,
      maxlength: [100, 'Inspector name cannot exceed 100 characters']
    },
    date: {
      type: Date
    },
    passed: {
      type: Boolean
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Inspection notes cannot exceed 500 characters']
    }
  },
  
  // Documentation
  documents: [{
    type: {
      type: String,
      enum: ['invoice', 'receipt', 'warranty', 'inspection-report', 'photos', 'other'],
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
  
  // Next Maintenance
  nextMaintenance: {
    type: {
      type: String,
      enum: ['scheduled', 'preventive', 'inspection', 'other']
    },
    dueDate: {
      type: Date
    },
    dueMileage: {
      type: Number,
      min: [0, 'Due mileage cannot be negative']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Next maintenance description cannot exceed 200 characters']
    }
  },
  
  // Approval and Sign-off
  approval: {
    required: {
      type: Boolean,
      default: false
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
    comments: {
      type: String,
      trim: true,
      maxlength: [500, 'Approval comments cannot exceed 500 characters']
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

// Virtual for total parts cost
maintenanceSchema.virtual('totalPartsCost').get(function() {
  return this.parts.reduce((total, part) => total + part.totalCost, 0);
});

// Virtual for maintenance duration
maintenanceSchema.virtual('maintenanceDuration').get(function() {
  if (!this.actualWork.startDate || !this.actualWork.endDate) return null;
  return this.actualWork.endDate - this.actualWork.startDate;
});

// Virtual for overdue status
maintenanceSchema.virtual('isOverdue').get(function() {
  return this.status !== 'completed' && this.scheduledDate < new Date();
});

// Indexes for performance
maintenanceSchema.index({ vehicle: 1, scheduledDate: -1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ type: 1 });
maintenanceSchema.index({ priority: 1 });
maintenanceSchema.index({ scheduledDate: 1 });
maintenanceSchema.index({ 'serviceProvider.name': 1 });

// Pre-save middleware to calculate total costs
maintenanceSchema.pre('save', function(next) {
  // Calculate parts cost
  this.costs.parts = this.parts.reduce((total, part) => total + part.totalCost, 0);
  
  // Calculate labor cost
  if (this.labor.hours && this.labor.rate) {
    this.labor.cost = this.labor.hours * this.labor.rate;
    this.costs.labor = this.labor.cost;
  }
  
  // Calculate total cost
  this.costs.total = this.costs.parts + this.costs.labor + this.costs.tax - this.costs.discount;
  
  next();
});

// Static methods
maintenanceSchema.statics.findByVehicle = function(vehicleId, status = null) {
  const query = { vehicle: vehicleId };
  if (status) query.status = status;
  return this.find(query).sort({ scheduledDate: -1 });
};

maintenanceSchema.statics.findOverdue = function() {
  return this.find({
    status: { $nin: ['completed', 'cancelled'] },
    scheduledDate: { $lt: new Date() }
  }).sort({ scheduledDate: 1 });
};

maintenanceSchema.statics.findUpcoming = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'scheduled',
    scheduledDate: { $gte: new Date(), $lte: futureDate }
  }).sort({ scheduledDate: 1 });
};

maintenanceSchema.statics.getCostSummary = function(vehicleId, startDate, endDate) {
  const matchStage = { vehicle: new mongoose.Types.ObjectId(vehicleId), status: 'completed' };
  if (startDate || endDate) {
    matchStage.scheduledDate = {};
    if (startDate) matchStage.scheduledDate.$gte = startDate;
    if (endDate) matchStage.scheduledDate.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: matchStage },
    { 
      $group: { 
        _id: null, 
        totalCost: { $sum: '$costs.total' },
        totalParts: { $sum: '$costs.parts' },
        totalLabor: { $sum: '$costs.labor' },
        count: { $sum: 1 }
      } 
    }
  ]);
};

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

export default Maintenance;
