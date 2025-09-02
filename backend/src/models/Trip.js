import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Trip = sequelize.define('Trip', {
  // Primary key
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Trip identification
  tripNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },

  // Foreign keys
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Vehicles',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  driverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Drivers',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },

  // Trip basic information
  purpose: {
    type: DataTypes.ENUM('delivery', 'pickup', 'service', 'transport', 'maintenance', 'emergency', 'other'),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Route information - normalized
  startLocation: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  startLatitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  startLongitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  endLocation: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  endLatitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  endLongitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  plannedDistance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  actualDistance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  distanceUnit: {
    type: DataTypes.ENUM('km', 'miles'),
    defaultValue: 'km',
  },
  routeType: {
    type: DataTypes.ENUM('shortest', 'fastest', 'custom', 'preferred'),
    allowNull: true,
  },

  // Schedule information - normalized
  plannedStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  plannedEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actualStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actualEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  estimatedDuration: {
    type: DataTypes.INTEGER, // Minutes
    allowNull: true,
  },
  actualDuration: {
    type: DataTypes.INTEGER, // Minutes
    allowNull: true,
  },

  // Status tracking
  status: {
    type: DataTypes.ENUM('planned', 'assigned', 'in-progress', 'completed', 'cancelled', 'delayed'),
    defaultValue: 'planned',
    allowNull: false,
  },
  statusUpdatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  statusUpdatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },

  // Odometer information - normalized
  odometerStart: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  odometerEnd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  odometerUnit: {
    type: DataTypes.ENUM('km', 'miles'),
    defaultValue: 'km',
  },

  // Fuel information - normalized
  fuelStart: {
    type: DataTypes.DECIMAL(5, 2), // Percentage or liters
    allowNull: true,
  },
  fuelEnd: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  fuelConsumed: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: true,
  },
  fuelUnit: {
    type: DataTypes.ENUM('liters', 'gallons', 'percentage'),
    defaultValue: 'liters',
  },
  fuelEfficiency: {
    type: DataTypes.DECIMAL(8, 3), // km/l or mpg
    allowNull: true,
  },

  // Cargo information - normalized
  cargoType: {
    type: DataTypes.ENUM('passengers', 'freight', 'equipment', 'materials', 'documents', 'mixed', 'empty'),
    allowNull: true,
  },
  cargoWeight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  cargoWeightUnit: {
    type: DataTypes.ENUM('kg', 'lbs', 'tons'),
    defaultValue: 'kg',
  },
  cargoVolume: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  cargoVolumeUnit: {
    type: DataTypes.ENUM('m3', 'ft3', 'liters'),
    defaultValue: 'm3',
  },
  cargoDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  passengerCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
    },
  },

  // Weather conditions - normalized
  weatherCondition: {
    type: DataTypes.ENUM(
      'clear', 'cloudy', 'rain', 'snow', 'fog', 'storm', 'wind', 'hot', 'cold', 'unknown'
    ),
    allowNull: true,
  },
  temperature: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  temperatureUnit: {
    type: DataTypes.ENUM('celsius', 'fahrenheit'),
    defaultValue: 'celsius',
  },
  visibility: {
    type: DataTypes.ENUM('excellent', 'good', 'moderate', 'poor', 'very_poor'),
    allowNull: true,
  },
  roadConditions: {
    type: DataTypes.ENUM('dry', 'wet', 'icy', 'snow', 'muddy', 'construction'),
    allowNull: true,
  },

  // Incidents tracking - normalized
  incidentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  hasAccidents: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hasBreakdowns: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hasTrafficViolations: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  incidentNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Documents - normalized
  contractNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  invoiceNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  documentUrls: {
    type: DataTypes.TEXT, // JSON array of document URLs
    allowNull: true,
  },
  photoUrls: {
    type: DataTypes.TEXT, // JSON array of photo URLs
    allowNull: true,
  },
  signatureUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },

  // Completion information - normalized
  completionStatus: {
    type: DataTypes.ENUM('successful', 'partial', 'failed', 'cancelled'),
    allowNull: true,
  },
  completionNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  customerSignature: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  customerRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5,
    },
  },
  customerFeedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Cost tracking - normalized
  estimatedCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  actualCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  fuelCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  tollsCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  parkingCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  otherCosts: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  billableAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },

  // Performance metrics
  averageSpeed: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
  },
  maxSpeed: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
  },
  idleTime: {
    type: DataTypes.INTEGER, // Minutes
    allowNull: true,
  },
  drivingTime: {
    type: DataTypes.INTEGER, // Minutes
    allowNull: true,
  },

  // Additional tracking
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  internalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'trips',
  timestamps: true,
  indexes: [
    // Foreign key indexes
    {
      fields: ['vehicleId'],
    },
    {
      fields: ['driverId'],
    },
    {
      fields: ['statusUpdatedBy'],
    },
    // Unique constraint
    {
      fields: ['tripNumber'],
      unique: true,
    },
    // Status and priority indexes
    {
      fields: ['status'],
    },
    {
      fields: ['priority'],
    },
    {
      fields: ['purpose'],
    },
    // Date-based indexes
    {
      fields: ['plannedStartDate'],
    },
    {
      fields: ['actualStartDate'],
    },
    {
      fields: ['actualEndDate'],
    },
    // Composite indexes for common queries
    {
      fields: ['vehicleId', 'status'],
    },
    {
      fields: ['driverId', 'status'],
    },
    {
      fields: ['vehicleId', 'plannedStartDate'],
    },
    {
      fields: ['status', 'plannedStartDate'],
    },
    {
      fields: ['priority', 'status'],
    },
    // Performance indexes
    {
      fields: ['completionStatus'],
    },
    // Location indexes
    {
      fields: ['startLatitude', 'startLongitude'],
    },
    {
      fields: ['endLatitude', 'endLongitude'],
    },
  ],
  validate: {
    // Validate date logic
    plannedDatesValid() {
      if (this.plannedStartDate && this.plannedEndDate) {
        if (this.plannedEndDate <= this.plannedStartDate) {
          throw new Error('Planned end date must be after start date');
        }
      }
    },
    actualDatesValid() {
      if (this.actualStartDate && this.actualEndDate) {
        if (this.actualEndDate <= this.actualStartDate) {
          throw new Error('Actual end date must be after start date');
        }
      }
    },
    // Validate odometer progression
    odometerValid() {
      if (this.odometerStart && this.odometerEnd) {
        if (this.odometerEnd < this.odometerStart) {
          throw new Error('End odometer reading cannot be less than start reading');
        }
      }
    },
    // Validate coordinates
    coordinatesValid() {
      if (this.startLatitude && (this.startLatitude < -90 || this.startLatitude > 90)) {
        throw new Error('Start latitude must be between -90 and 90');
      }
      if (this.startLongitude && (this.startLongitude < -180 || this.startLongitude > 180)) {
        throw new Error('Start longitude must be between -180 and 180');
      }
      if (this.endLatitude && (this.endLatitude < -90 || this.endLatitude > 90)) {
        throw new Error('End latitude must be between -90 and 90');
      }
      if (this.endLongitude && (this.endLongitude < -180 || this.endLongitude > 180)) {
        throw new Error('End longitude must be between -180 and 180');
      }
    },
    // Validate fuel levels
    fuelValid() {
      if (this.fuelStart && this.fuelUnit === 'percentage') {
        if (this.fuelStart < 0 || this.fuelStart > 100) {
          throw new Error('Fuel start percentage must be between 0 and 100');
        }
      }
      if (this.fuelEnd && this.fuelUnit === 'percentage') {
        if (this.fuelEnd < 0 || this.fuelEnd > 100) {
          throw new Error('Fuel end percentage must be between 0 and 100');
        }
      }
    },
    // Validate cost calculations
    costValid() {
      if (this.totalCost && (this.fuelCost || this.tollsCost || this.parkingCost || this.otherCosts)) {
        const calculatedTotal = (this.fuelCost || 0) + (this.tollsCost || 0) + 
                               (this.parkingCost || 0) + (this.otherCosts || 0);
        const difference = Math.abs(this.totalCost - calculatedTotal);
        if (difference > 0.01) {
          throw new Error('Total cost does not match sum of individual costs');
        }
      }
    },
  },
});

export default Trip;