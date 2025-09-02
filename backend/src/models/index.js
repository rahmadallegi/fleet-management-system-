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

// Define relationships - improved organization and error handling
const defineAssociations = () => {
  try {
    // Call individual model associate methods if they exist
    Object.values(models)
      .filter(model => typeof model.associate === 'function')
      .forEach(model => model.associate(models));

    // Core Vehicle-Driver relationships
    Vehicle.belongsTo(Driver, { 
      as: 'assignedDriver', 
      foreignKey: 'assignedDriverId',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    Driver.hasMany(Vehicle, { 
      as: 'assignedVehicles', 
      foreignKey: 'assignedDriverId'
    });

    // Trip relationships
    Trip.belongsTo(Vehicle, { 
      as: 'vehicle', 
      foreignKey: 'vehicleId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Vehicle.hasMany(Trip, { 
      as: 'trips', 
      foreignKey: 'vehicleId'
    });

    Trip.belongsTo(Driver, { 
      as: 'driver', 
      foreignKey: 'driverId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Driver.hasMany(Trip, { 
      as: 'trips', 
      foreignKey: 'driverId'
    });

    // FuelLog relationships
    FuelLog.belongsTo(Vehicle, { 
      as: 'vehicle', 
      foreignKey: 'vehicleId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Vehicle.hasMany(FuelLog, { 
      as: 'fuelLogs', 
      foreignKey: 'vehicleId'
    });

    FuelLog.belongsTo(Driver, { 
      as: 'driver', 
      foreignKey: 'driverId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Driver.hasMany(FuelLog, { 
      as: 'fuelLogs', 
      foreignKey: 'driverId'
    });

    FuelLog.belongsTo(Trip, { 
      as: 'trip', 
      foreignKey: 'tripId',
      onDelete: 'SET NULL', // Allow fuel logs to exist without trips
      onUpdate: 'CASCADE'
    });
    Trip.hasMany(FuelLog, { 
      as: 'fuelLogs', 
      foreignKey: 'tripId'
    });

    // Maintenance relationships
    Maintenance.belongsTo(Vehicle, { 
      as: 'vehicle', 
      foreignKey: 'vehicleId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Vehicle.hasMany(Maintenance, { 
      as: 'maintenances', 
      foreignKey: 'vehicleId'
    });

    // Alert relationships
    Alert.belongsTo(Vehicle, { 
      as: 'vehicle', 
      foreignKey: 'vehicleId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Vehicle.hasMany(Alert, { 
      as: 'alerts', 
      foreignKey: 'vehicleId'
    });

    Alert.belongsTo(Driver, { 
      as: 'driver', 
      foreignKey: 'driverId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Driver.hasMany(Alert, { 
      as: 'alerts', 
      foreignKey: 'driverId'
    });

    Alert.belongsTo(Trip, { 
      as: 'trip', 
      foreignKey: 'tripId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Trip.hasMany(Alert, { 
      as: 'alerts', 
      foreignKey: 'tripId'
    });

    Alert.belongsTo(User, { 
      as: 'user', 
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    User.hasMany(Alert, { 
      as: 'alerts', 
      foreignKey: 'userId'
    });

    console.log('✅ Model associations defined successfully');
  } catch (error) {
    console.error('❌ Error defining model associations:', error);
    throw error;
  }
};

// Call associations
defineAssociations();

export { sequelize };
export default models;

// Enhanced database utility functions
export const dbUtils = {
  // Generate unique identifiers with better uniqueness
  generateTripNumber: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 8); // Increased randomness
    return `TRP-${timestamp.toUpperCase()}-${random.toUpperCase()}`;
  },

  generateAlertId: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 8);
    return `ALT-${timestamp.toUpperCase()}-${random.toUpperCase()}`;
  },

  generateFuelLogNumber: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return `FUL-${timestamp.toUpperCase()}-${random.toUpperCase()}`;
  },

  generateMaintenanceNumber: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return `MNT-${timestamp.toUpperCase()}-${random.toUpperCase()}`;
  },

  // Enhanced date utilities
  isDateInFuture: (date) => {
    if (!date) return false;
    return new Date(date) > new Date();
  },

  isDateInPast: (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  },

  daysBetween: (date1, date2) => {
    if (!date1 || !date2) return null;
    return Math.ceil(Math.abs(new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24));
  },

  isWithinDateRange: (date, startDate, endDate) => {
    const checkDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return checkDate >= start && checkDate <= end;
  },

  // Distance calculation (Haversine formula)
  calculateDistance: (lat1, lng1, lat2, lng2, unit = 'km') => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return null;
    
    const R = unit === 'miles' ? 3959 : 6371; // Earth's radius
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) * 100) / 100; // Round to 2 decimal places
  },

  // Enhanced fuel efficiency calculations
  calculateFuelEfficiency: (distance, fuelConsumed, unit = 'km') => {
    if (!distance || !fuelConsumed || fuelConsumed === 0) return null;
    const efficiency = distance / fuelConsumed;
    return Math.round(efficiency * 100) / 100; // Round to 2 decimal places
  },

  calculateFuelCost: (quantity, pricePerUnit, taxes = 0, discounts = 0) => {
    if (!quantity || !pricePerUnit) return null;
    const baseCost = quantity * pricePerUnit;
    const totalCost = baseCost + taxes - discounts;
    return Math.round(totalCost * 100) / 100;
  },

  // Enhanced cost calculations
  calculateTotalCost: (parts = 0, labor = 0, tax = 0, discount = 0) => {
    const total = parts + labor + tax - discount;
    return Math.round(total * 100) / 100;
  },

  calculateCostPerKm: (totalCost, distance) => {
    if (!totalCost || !distance || distance === 0) return null;
    return Math.round((totalCost / distance) * 100) / 100;
  },

  // Enhanced status helpers
  getVehicleAvailability: (status, currentTrips = []) => {
    if (!status || status !== 'active') return 'out-of-service';
    if (currentTrips && currentTrips.length > 0) {
      // Check if any trips are currently ongoing
      const ongoingTrips = currentTrips.filter(trip => 
        trip.status === 'in-progress' || trip.status === 'started'
      );
      if (ongoingTrips.length > 0) return 'in-use';
    }
    return 'available';
  },

  getDriverAvailability: (status, currentTrips = []) => {
    if (!status || status !== 'active') return 'unavailable';
    if (currentTrips && currentTrips.length > 0) {
      const ongoingTrips = currentTrips.filter(trip => 
        trip.status === 'in-progress' || trip.status === 'started'
      );
      if (ongoingTrips.length > 0) return 'on-duty';
    }
    return 'available';
  },

  // Data validation helpers
  validateCoordinates: (lat, lng) => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhoneNumber: (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
  },

  // Performance monitoring
  logQueryPerformance: (queryName, startTime) => {
    const duration = Date.now() - startTime;
    if (duration > 1000) { // Log slow queries (>1s)
      console.warn(`⚠️  Slow query detected: ${queryName} took ${duration}ms`);
    }
    return duration;
  }
};

// Enhanced database initialization
export const initializeDatabase = async (options = {}) => {
  const { force = false, alter = true, logging = true } = options;
  
  try {
    console.log('🚀 Initializing database setup...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync database schema
    await sequelize.sync({ force, alter });
    console.log('✅ Database synchronized');
    
    // Create indexes if needed
    console.log('📊 Creating database indexes...');
    // Additional indexes can be created here if needed
    
    console.log('✅ Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Enhanced graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, initiating graceful shutdown...`);
  
  try {
    // Close database connection
    await sequelize.close();
    console.log('✅ Database connection closed');
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle multiple shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});