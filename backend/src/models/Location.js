import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Location = sequelize.define('Location', {
  // Primary key
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Foreign keys with proper constraints
  tripId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { 
      model: 'Trips', 
      key: 'id' 
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { 
      model: 'Vehicles', 
      key: 'id' 
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  driverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { 
      model: 'Drivers', 
      key: 'id' 
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },

  // GPS Coordinates with proper precision and validation
  latitude: { 
    type: DataTypes.DECIMAL(10, 8), // Better precision for coordinates
    allowNull: false,
    validate: {
      min: -90,
      max: 90,
    },
  },
  longitude: { 
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    validate: {
      min: -180,
      max: 180,
    },
  },
  altitude: { 
    type: DataTypes.DECIMAL(8, 2), // Meters, with decimals
    allowNull: true,
  },
  accuracy: { 
    type: DataTypes.DECIMAL(8, 2), // GPS accuracy in meters
    allowNull: true,
    validate: {
      min: 0,
    },
  },

  // Timestamp
  timestamp: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW,
  },

  // Speed and Direction with proper constraints
  speed: { 
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  speedUnit: { 
    type: DataTypes.ENUM('km/h', 'mph', 'm/s'),
    allowNull: true,
    defaultValue: 'km/h',
  },
  heading: { 
    type: DataTypes.DECIMAL(5, 2), // Degrees (0-360)
    allowNull: true,
    validate: {
      min: 0,
      max: 360,
    },
  },

  // Address Information with proper field lengths
  addressFormatted: { 
    type: DataTypes.TEXT,
    allowNull: true,
  },
  addressStreet: { 
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  addressCity: { 
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  addressState: { 
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  addressCountry: { 
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  addressPostalCode: { 
    type: DataTypes.STRING(20),
    allowNull: true,
  },

  // Location Type with predefined options
  locationType: { 
    type: DataTypes.ENUM(
      'start', 'end', 'waypoint', 'stop', 'parking', 
      'fuel_station', 'maintenance', 'depot', 'other'
    ),
    allowNull: true,
    defaultValue: 'waypoint',
  },

  // Vehicle Status with proper data types
  ignition: { 
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  engine: { 
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  doors: { 
    type: DataTypes.ENUM('all_closed', 'driver_open', 'passenger_open', 'rear_open', 'multiple_open'),
    allowNull: true,
  },
  fuelLevel: { 
    type: DataTypes.DECIMAL(5, 2), // Percentage 0-100.00
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
  },
  fuelUnit: { 
    type: DataTypes.ENUM('percentage', 'liters', 'gallons'),
    allowNull: true,
    defaultValue: 'percentage',
  },
  odometerReading: { 
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  odometerUnit: { 
    type: DataTypes.ENUM('km', 'miles'),
    allowNull: true,
    defaultValue: 'km',
  },

  // Environmental Data with constraints
  temperature: { 
    type: DataTypes.DECIMAL(5, 2), // Celsius
    allowNull: true,
    validate: {
      min: -50,
      max: 70, // Reasonable temperature range for vehicle operations
    },
  },
  humidity: { 
    type: DataTypes.DECIMAL(5, 2), // Percentage
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
  },
  weather: { 
    type: DataTypes.ENUM(
      'clear', 'cloudy', 'rain', 'snow', 'fog', 
      'storm', 'wind', 'hot', 'cold', 'unknown'
    ),
    allowNull: true,
  },

  // Notes
  notes: { 
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Data Source with constraints
  device: { 
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  deviceId: { 
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  provider: { 
    type: DataTypes.ENUM('gps', 'cellular', 'wifi', 'bluetooth', 'manual', 'obd', 'telematics'),
    allowNull: true,
  },
  signalStrength: { 
    type: DataTypes.DECIMAL(5, 2), // Signal strength percentage or dBm
    allowNull: true,
  },

  // Data Quality with proper constraints
  gpsQuality: { 
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'no_signal'),
    allowNull: true,
  },
  satelliteCount: { 
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 50, // Reasonable max satellites
    },
  },
  hdop: { 
    type: DataTypes.DECIMAL(4, 2), // Horizontal Dilution of Precision
    allowNull: true,
    validate: {
      min: 0,
    },
  },

  // Processing Status
  processed: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false,
    allowNull: false,
  },
  processedAt: { 
    type: DataTypes.DATE,
    allowNull: true,
  },
  processedBy: {
    type: DataTypes.STRING(50), // System/user that processed the data
    allowNull: true,
  },

  // Additional tracking fields
  isGeofenceEvent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  geofenceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Geofences', // If you have a geofences table
      key: 'id',
    },
  },
  eventType: {
    type: DataTypes.ENUM(
      'location_update', 'geofence_enter', 'geofence_exit', 
      'speed_limit_exceeded', 'harsh_braking', 'harsh_acceleration',
      'idle_start', 'idle_end', 'engine_on', 'engine_off'
    ),
    allowNull: true,
  },
}, {
  tableName: 'locations',
  timestamps: true, // Adds createdAt and updatedAt
  indexes: [
    // Primary indexes for relationships
    {
      fields: ['tripId'],
    },
    {
      fields: ['vehicleId'],
    },
    {
      fields: ['driverId'],
    },
    // Timestamp index for time-based queries
    {
      fields: ['timestamp'],
    },
    // Location-based indexes
    {
      fields: ['latitude', 'longitude'],
    },
    // Composite indexes for common query patterns
    {
      fields: ['vehicleId', 'timestamp'],
    },
    {
      fields: ['tripId', 'timestamp'],
    },
    {
      fields: ['driverId', 'timestamp'],
    },
    // Event-based indexes
    {
      fields: ['locationType'],
    },
    {
      fields: ['eventType'],
    },
    {
      fields: ['processed'],
    },
    // Geospatial index (if your database supports it)
    // Note: This requires database-specific configuration
    // {
    //   fields: ['latitude', 'longitude'],
    //   type: 'SPATIAL'
    // },
  ],
  validate: {
    // Custom validation: ensure coordinates are provided together
    coordinatesComplete() {
      if ((this.latitude === null) !== (this.longitude === null)) {
        throw new Error('Both latitude and longitude must be provided together');
      }
    },
    // Validate fuel level is reasonable
    fuelLevelRange() {
      if (this.fuelLevel !== null && this.fuelUnit === 'percentage') {
        if (this.fuelLevel < 0 || this.fuelLevel > 100) {
          throw new Error('Fuel level percentage must be between 0 and 100');
        }
      }
    },
  },
});

export default Location;
