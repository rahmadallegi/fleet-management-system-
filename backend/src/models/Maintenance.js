import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Maintenance = sequelize.define('Maintenance', {
  // Primary key
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Maintenance reference number
  maintenanceNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
  },

  // Foreign key
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

  // Basic maintenance information
  type: {
    type: DataTypes.ENUM(
      'scheduled', 'preventive', 'corrective', 'emergency', 'inspection',
      'oil-change', 'tire-rotation', 'brake-service', 'engine-service',
      'transmission-service', 'electrical', 'bodywork', 'other'
    ),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('engine', 'transmission', 'brakes', 'tires', 'electrical', 'body', 'interior', 'other'),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent', 'critical'),
    defaultValue: 'normal',
    allowNull: false,
  },

  // Scheduling information
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  scheduledTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  estimatedDurationHours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  estimatedDurationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 59,
    },
  },

  // Actual timing
  actualStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actualEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actualDurationHours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },

  // Status tracking
  status: {
    type: DataTypes.ENUM('scheduled', 'in-progress', 'completed', 'cancelled', 'postponed', 'overdue'),
    defaultValue: 'scheduled',
    allowNull: false,
  },
  statusUpdatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Service provider information
  serviceProviderName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  serviceProviderContact: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  serviceProviderAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  serviceProviderPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  serviceProviderEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  // Work order information
  workOrderNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  workOrderDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  workOrderInstructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Odometer readings
  odometerBefore: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  odometerAfter: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  odometerUnit: {
    type: DataTypes.ENUM('km', 'miles'),
    defaultValue: 'km',
  },

  // Cost breakdown
  partsCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  laborCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },

  // Parts information (main parts - for detailed parts, use separate PartsUsed table)
  mainPartsUsed: {
    type: DataTypes.TEXT, // JSON string for flexibility, but consider separate table
    allowNull: true,
  },
  partsSupplier: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  warrantyParts: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  warrantyLabor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  warrantyExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Vehicle condition assessment
  conditionBefore: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'critical'),
    allowNull: true,
  },
  conditionAfter: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'critical'),
    allowNull: true,
  },
  issuesFound: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  issuesResolved: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  recommendedActions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Inspection details
  inspectionPassed: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  inspectionCertificateNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  inspectionExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  inspectorName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  inspectionNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Documentation
  receiptNumber: {
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
  photosUrls: {
    type: DataTypes.TEXT, // JSON array of photo URLs
    allowNull: true,
  },

  // Next maintenance planning
  nextMaintenanceDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  nextMaintenanceOdometer: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  nextMaintenanceType: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  maintenanceInterval: {
    type: DataTypes.INTEGER, // Days
    allowNull: true,
  },
  odometerInterval: {
    type: DataTypes.INTEGER, // KM or miles
    allowNull: true,
  },

  // Approval workflow
  approvalRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'not_required'),
    defaultValue: 'not_required',
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  approvalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Personnel
  performedBy: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  supervisedBy: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  authorizedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },

  // Additional notes and comments
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  internalNotes: {
    type: DataTypes.TEXT,
    allowNull: true, // Private notes not shown to customers
  },
}, {
  tableName: 'maintenances',
  timestamps: true,
  indexes: [
    // Foreign key indexes
    {
      fields: ['vehicleId'],
    },
    {
      fields: ['approvedBy'],
    },
    {
      fields: ['authorizedBy'],
    },
    // Status and type indexes
    {
      fields: ['status'],
    },
    {
      fields: ['type'],
    },
    {
      fields: ['category'],
    },
    {
      fields: ['priority'],
    },
    // Date-based indexes
    {
      fields: ['scheduledDate'],
    },
    {
      fields: ['actualStartDate'],
    },
    {
      fields: ['nextMaintenanceDate'],
    },
    // Composite indexes for common queries
    {
      fields: ['vehicleId', 'scheduledDate'],
    },
    {
      fields: ['vehicleId', 'status'],
    },
    {
      fields: ['type', 'status'],
    },
    {
      fields: ['priority', 'scheduledDate'],
    },
    // Approval workflow indexes
    {
      fields: ['approvalStatus'],
    },
    {
      fields: ['approvalRequired', 'approvalStatus'],
    },
  ],
  validate: {
    // Ensure end date is after start date
    actualDatesValid() {
      if (this.actualStartDate && this.actualEndDate) {
        if (this.actualEndDate <= this.actualStartDate) {
          throw new Error('Actual end date must be after start date');
        }
      }
    },
    // Validate odometer progression
    odometerValid() {
      if (this.odometerBefore && this.odometerAfter) {
        if (this.odometerAfter < this.odometerBefore) {
          throw new Error('Odometer after maintenance cannot be less than before');
        }
      }
    },
    // Validate cost calculations
    costValid() {
      if (this.totalCost && (this.partsCost || this.laborCost)) {
        const calculatedTotal = (this.partsCost || 0) + (this.laborCost || 0) + 
                               (this.taxAmount || 0) - (this.discountAmount || 0);
        const difference = Math.abs(this.totalCost - calculatedTotal);
        if (difference > 0.01) { // Allow for rounding differences
          throw new Error('Total cost does not match sum of parts, labor, tax, and discount');
        }
      }
    },
  },
});

export default Maintenance;