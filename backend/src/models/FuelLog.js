import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const FuelLog = sequelize.define('FuelLog', {
  // Primary key (auto-generated)
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  
  // Date and time
  date: {
    type: DataTypes.DATEONLY, // Use DATEONLY for just date without time
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME, // Use TIME type for time values
    allowNull: true,
  },
  
  // Location - normalized to separate fields
  locationName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  locationAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8), // Precision for GPS coordinates
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  
  // Fuel information
  fuelType: {
    type: DataTypes.ENUM('gasoline', 'diesel', 'premium', 'lpg', 'cng', 'electric', 'other'),
    allowNull: false,
  },
  
  // Quantity - normalized
  quantityValue: {
    type: DataTypes.DECIMAL(10, 3), // Supports up to 9,999,999.999
    allowNull: false,
  },
  quantityUnit: {
    type: DataTypes.ENUM('liters', 'gallons', 'kwh', 'kg'),
    allowNull: false,
    defaultValue: 'liters',
  },
  
  // Cost - normalized
  costAmount: {
    type: DataTypes.DECIMAL(10, 2), // Standard for currency
    allowNull: false,
  },
  costCurrency: {
    type: DataTypes.STRING(3), // ISO currency code (USD, EUR, etc.)
    allowNull: false,
    defaultValue: 'USD',
  },
  pricePerUnit: {
    type: DataTypes.DECIMAL(10, 4), // Price per liter/gallon
    allowNull: true,
  },
  
  // Odometer - normalized
  odometerReading: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  odometerUnit: {
    type: DataTypes.ENUM('km', 'miles'),
    allowNull: true,
    defaultValue: 'km',
  },
  
  // Fuel level - normalized
  fuelLevelBefore: {
    type: DataTypes.DECIMAL(5, 2), // Percentage (0-100.00)
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
  },
  fuelLevelAfter: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
  },
  
  // Payment information
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'credit_card', 'debit_card', 'mobile_payment', 'fuel_card', 'other'),
    allowNull: true,
  },
  paymentReference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  // Efficiency calculations
  fuelEfficiency: {
    type: DataTypes.DECIMAL(8, 3), // km/l or mpg
    allowNull: true,
  },
  efficiencyUnit: {
    type: DataTypes.ENUM('km_per_liter', 'miles_per_gallon', 'liters_per_100km'),
    allowNull: true,
  },
  distanceTraveled: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  
  // Fuel quality
  fuelQualityRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5,
    },
  },
  fuelQualityNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Emissions (if tracked)
  co2Emissions: {
    type: DataTypes.DECIMAL(8, 3), // kg of CO2
    allowNull: true,
  },
  
  // Receipt information
  receiptNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  receiptImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  // Status fields
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verifiedBy: {
    type: DataTypes.INTEGER, // Foreign key to User table
    allowNull: true,
  },
  approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  approvedBy: {
    type: DataTypes.INTEGER, // Foreign key to User table
    allowNull: true,
  },
  
  // Reimbursement
  reimbursementRequested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  reimbursementAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  reimbursementStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'paid'),
    allowNull: true,
  },
  reimbursementDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Additional notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Foreign keys (add these based on your relationships)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Adjust table name as needed
      key: 'id',
    },
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Vehicles', // Adjust table name as needed
      key: 'id',
    },
  },
}, {
  tableName: 'fuel_logs',
  timestamps: true, // Adds createdAt and updatedAt
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['vehicleId'],
    },
    {
      fields: ['date'],
    },
    {
      fields: ['fuelType'],
    },
    {
      fields: ['verified'],
    },
    {
      fields: ['approved'],
    },
  ],
});

export default FuelLog;