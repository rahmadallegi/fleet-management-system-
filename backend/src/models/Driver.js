import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value) {
        const age = (new Date() - value) / (365.25 * 24 * 60 * 60 * 1000);
        return age >= 18 && age <= 80;
      },
      message: 'Driver must be between 18 and 80 years old'
    }
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female', 'other', 'prefer-not-to-say'],
      message: 'Gender must be one of: male, female, other, prefer-not-to-say'
    }
  },
  
  // Contact Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    primary: {
      type: String,
      required: [true, 'Primary phone number is required'],
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    secondary: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    }
  },
  
  // Address
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
      maxlength: [20, 'ZIP code cannot exceed 20 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters'],
      default: 'United States'
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required'],
      trim: true,
      maxlength: [100, 'Emergency contact name cannot exceed 100 characters']
    },
    relationship: {
      type: String,
      required: [true, 'Emergency contact relationship is required'],
      trim: true,
      maxlength: [50, 'Relationship cannot exceed 50 characters']
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    }
  },
  
  // Employment Information
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Employee ID cannot exceed 50 characters']
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required'],
    default: Date.now
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters'],
    default: 'Driver'
  },
  salary: {
    amount: {
      type: Number,
      min: [0, 'Salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      maxlength: [3, 'Currency code cannot exceed 3 characters']
    },
    payPeriod: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly'
    }
  },
  
  // Driver's License Information
  license: {
    number: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'License number cannot exceed 50 characters']
    },
    class: {
      type: String,
      required: [true, 'License class is required'],
      enum: {
        values: ['A', 'B', 'C', 'CDL-A', 'CDL-B', 'CDL-C', 'M', 'other'],
        message: 'License class must be one of: A, B, C, CDL-A, CDL-B, CDL-C, M, other'
      }
    },
    state: {
      type: String,
      required: [true, 'License state is required'],
      trim: true,
      maxlength: [50, 'License state cannot exceed 50 characters']
    },
    issueDate: {
      type: Date,
      required: [true, 'License issue date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'License expiry date is required'],
      validate: {
        validator: function(value) {
          return value > new Date();
        },
        message: 'License expiry date must be in the future'
      }
    },
    restrictions: [{
      type: String,
      trim: true
    }],
    endorsements: [{
      type: String,
      trim: true
    }]
  },
  
  // Medical Information
  medical: {
    dotPhysicalExpiry: {
      type: Date
    },
    medicalRestrictions: [{
      type: String,
      trim: true
    }],
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']
    },
    allergies: [{
      type: String,
      trim: true
    }]
  },
  
  // Status & Availability
  status: {
    type: String,
    required: [true, 'Driver status is required'],
    enum: {
      values: ['active', 'inactive', 'suspended', 'terminated', 'on-leave'],
      message: 'Status must be one of: active, inactive, suspended, terminated, on-leave'
    },
    default: 'active'
  },
  availability: {
    type: String,
    enum: {
      values: ['available', 'on-duty', 'off-duty', 'on-break', 'unavailable'],
      message: 'Availability must be one of: available, on-duty, off-duty, on-break, unavailable'
    },
    default: 'available'
  },
  
  // Vehicle Assignment
  assignedVehicles: [{
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Performance & Records
  performance: {
    totalTrips: {
      type: Number,
      default: 0,
      min: [0, 'Total trips cannot be negative']
    },
    totalMiles: {
      type: Number,
      default: 0,
      min: [0, 'Total miles cannot be negative']
    },
    totalHours: {
      type: Number,
      default: 0,
      min: [0, 'Total hours cannot be negative']
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5']
    },
    safetyScore: {
      type: Number,
      min: [0, 'Safety score must be between 0 and 100'],
      max: [100, 'Safety score must be between 0 and 100']
    }
  },
  
  // Violations & Incidents
  violations: [{
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['speeding', 'parking', 'traffic', 'safety', 'other']
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    fine: {
      type: Number,
      min: [0, 'Fine amount cannot be negative']
    },
    points: {
      type: Number,
      min: [0, 'Points cannot be negative']
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'contested', 'dismissed'],
      default: 'pending'
    }
  }],
  
  // Training & Certifications
  training: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    provider: {
      type: String,
      trim: true
    },
    completionDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date
    },
    certificateUrl: {
      type: String
    }
  }],
  
  // Documents & Files
  documents: [{
    type: {
      type: String,
      enum: ['license', 'medical', 'training', 'contract', 'other'],
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
  
  // Profile Image
  avatar: {
    type: String // URL to profile image
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

// Virtual for full name
driverSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
driverSchema.virtual('age').get(function() {
  return Math.floor((new Date() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

// Virtual for license status
driverSchema.virtual('licenseStatus').get(function() {
  if (!this.license.expiryDate) return 'unknown';
  const now = new Date();
  const expiryDate = new Date(this.license.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring-soon';
  return 'valid';
});

// Virtual for years of service
driverSchema.virtual('yearsOfService').get(function() {
  return Math.floor((new Date() - this.hireDate) / (365.25 * 24 * 60 * 60 * 1000));
});

// Indexes for performance
driverSchema.index({ email: 1 });
driverSchema.index({ employeeId: 1 });
driverSchema.index({ 'license.number': 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ availability: 1 });
driverSchema.index({ 'license.expiryDate': 1 });

// Static methods
driverSchema.statics.findAvailable = function() {
  return this.find({ 
    status: 'active', 
    availability: 'available' 
  });
};

driverSchema.statics.findExpiringLicenses = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'license.expiryDate': { $lte: futureDate }
  });
};

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;
