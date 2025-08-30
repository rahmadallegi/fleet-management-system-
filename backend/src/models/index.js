import sequelize from '../config/sequelize.js';
import User from './User.js';
import Vehicle from './Vehicle.js';
import Driver from './Driver.js';
import Trip from './Trip.js';
import FuelLog from './FuelLog.js';
import Maintenance from './Maintenance.js';
import Alert from './Alert.js';

const models = {
  User,
  Vehicle,
  Driver,
  Trip,
  FuelLog,
  Maintenance,
  Alert,
};

// Define relationships
Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(models));

// Relationships
Vehicle.belongsTo(Driver, { as: 'assignedDriver', foreignKey: 'assignedDriverId' });
Driver.hasMany(Vehicle, { as: 'assignedVehicles', foreignKey: 'assignedDriverId' });

Trip.belongsTo(Vehicle, { as: 'vehicle', foreignKey: 'vehicleId' });
Vehicle.hasMany(Trip, { as: 'trips', foreignKey: 'vehicleId' });

Trip.belongsTo(Driver, { as: 'driver', foreignKey: 'driverId' });
Driver.hasMany(Trip, { as: 'trips', foreignKey: 'driverId' });

FuelLog.belongsTo(Vehicle, { as: 'vehicle', foreignKey: 'vehicleId' });
Vehicle.hasMany(FuelLog, { as: 'fuelLogs', foreignKey: 'vehicleId' });

FuelLog.belongsTo(Driver, { as: 'driver', foreignKey: 'driverId' });
Driver.hasMany(FuelLog, { as: 'fuelLogs', foreignKey: 'driverId' });

FuelLog.belongsTo(Trip, { as: 'trip', foreignKey: 'tripId' });
Trip.hasMany(FuelLog, { as: 'fuelLogs', foreignKey: 'tripId' });

Maintenance.belongsTo(Vehicle, { as: 'vehicle', foreignKey: 'vehicleId' });
Vehicle.hasMany(Maintenance, { as: 'maintenances', foreignKey: 'vehicleId' });

Alert.belongsTo(Vehicle, { as: 'vehicle', foreignKey: 'vehicleId' });
Vehicle.hasMany(Alert, { as: 'alerts', foreignKey: 'vehicleId' });

Alert.belongsTo(Driver, { as: 'driver', foreignKey: 'driverId' });
Driver.hasMany(Alert, { as: 'alerts', foreignKey: 'driverId' });

Alert.belongsTo(Trip, { as: 'trip', foreignKey: 'tripId' });
Trip.hasMany(Alert, { as: 'alerts', foreignKey: 'tripId' });

Alert.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(Alert, { as: 'alerts', foreignKey: 'userId' });

export { sequelize };
export default models;

// Database utility functions
export const dbUtils = {
  // Generate unique identifiers
  generateTripNumber: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TRP-${timestamp}-${random}`.toUpperCase();
  },

  generateAlertId: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ALT-${timestamp}-${random}`.toUpperCase();
  },

  // Date utilities
  isDateInFuture: (date) => new Date(date) > new Date(),
  isDateInPast: (date) => new Date(date) < new Date(),
  daysBetween: (date1, date2) => Math.ceil((new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24)),

  // Distance calculation
  calculateDistance: (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  },

  // Fuel efficiency calculation
  calculateFuelEfficiency: (distance, fuelConsumed, unit = 'km') => {
    if (!distance || !fuelConsumed || fuelConsumed === 0) return null;
    return unit === 'km' ? distance / fuelConsumed : distance / fuelConsumed; // km/l or miles/gallon
  },

  // Cost calculations
  calculateTotalCost: (parts, labor, tax = 0, discount = 0) => {
    return parts + labor + tax - discount;
  },

  // Status helpers
  getVehicleAvailability: (status, currentTrips) => {
    if (status !== 'active') return 'out-of-service';
    if (currentTrips && currentTrips.length > 0) return 'in-use';
    return 'available';
  },

  getDriverAvailability: (status, currentTrips) => {
    if (status !== 'active') return 'unavailable';
    if (currentTrips && currentTrips.length > 0) return 'on-duty';
    return 'available';
  }
};

// Initialize database setup
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing database setup...');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');
    
    console.log('✅ Database initialization completed');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database connection...');
  await sequelize.close();
  process.exit(0);
});