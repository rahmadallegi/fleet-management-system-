// Import all models
import mongoose from 'mongoose';
import User from './User.js';
import Vehicle from './Vehicle.js';
import Driver from './Driver.js';
import Trip from './Trip.js';
import Location from './Location.js';
import FuelLog from './FuelLog.js';
import Maintenance from './Maintenance.js';
import Alert from './Alert.js';

// Export all models
export {
  User,
  Vehicle,
  Driver,
  Trip,
  Location,
  FuelLog,
  Maintenance,
  Alert
};

// Model relationships and validation setup
export const setupModelRelationships = () => {
  console.log('📋 Setting up model relationships...');
  
  // Vehicle-Driver relationships
  Vehicle.schema.add({
    currentDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    }
  });
  
  // Driver-Vehicle relationships (virtual)
  Driver.schema.virtual('currentVehicle', {
    ref: 'Vehicle',
    localField: '_id',
    foreignField: 'assignedDriver',
    justOne: true
  });
  
  // Trip relationships (already defined in schemas)
  // Trip -> Vehicle, Driver
  // Location -> Trip, Vehicle, Driver
  // FuelLog -> Vehicle, Driver, Trip
  // Maintenance -> Vehicle
  // Alert -> Vehicle, Driver, Trip, User
  
  console.log('✅ Model relationships configured');
};

// Database validation and constraints
export const setupDatabaseConstraints = () => {
  console.log('🔒 Setting up database constraints...');
  
  // Ensure unique constraints
  const uniqueConstraints = [
    { model: User, field: 'email', message: 'Email already exists' },
    { model: Vehicle, field: 'plateNumber', message: 'Plate number already exists' },
    { model: Driver, field: 'email', message: 'Driver email already exists' },
    { model: Driver, field: 'employeeId', message: 'Employee ID already exists' },
    { model: Driver, field: 'license.number', message: 'License number already exists' },
    { model: Trip, field: 'tripNumber', message: 'Trip number already exists' },
    { model: Alert, field: 'alertId', message: 'Alert ID already exists' }
  ];
  
  uniqueConstraints.forEach(constraint => {
    constraint.model.schema.index({ [constraint.field]: 1 }, { unique: true });
  });
  
  console.log('✅ Database constraints configured');
};

// Model validation helpers
export const validateModelData = {
  // User validation
  user: {
    isValidRole: (role) => ['admin', 'dispatcher', 'driver', 'viewer'].includes(role),
    isValidEmail: (email) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email),
    isValidPhone: (phone) => /^\+?[\d\s-()]+$/.test(phone)
  },
  
  // Vehicle validation
  vehicle: {
    isValidPlateNumber: (plateNumber) => plateNumber && plateNumber.length >= 3,
    isValidYear: (year) => year >= 1900 && year <= new Date().getFullYear() + 1,
    isValidStatus: (status) => ['active', 'inactive', 'maintenance', 'repair', 'retired', 'sold'].includes(status)
  },
  
  // Driver validation
  driver: {
    isValidAge: (dateOfBirth) => {
      const age = (new Date() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 18 && age <= 80;
    },
    isValidLicense: (licenseNumber) => licenseNumber && licenseNumber.length >= 5,
    isValidEmployeeId: (employeeId) => employeeId && employeeId.length >= 3
  },
  
  // Trip validation
  trip: {
    isValidDateRange: (startDate, endDate) => new Date(endDate) > new Date(startDate),
    isValidCoordinates: (lat, lng) => lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180,
    isValidStatus: (status) => ['planned', 'assigned', 'in-progress', 'completed', 'cancelled', 'delayed'].includes(status)
  },
  
  // Location validation
  location: {
    isValidCoordinates: (lat, lng) => lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180,
    isValidSpeed: (speed) => speed >= 0 && speed <= 300, // km/h
    isValidHeading: (heading) => heading >= 0 && heading <= 360
  },
  
  // Fuel validation
  fuel: {
    isValidQuantity: (quantity) => quantity > 0 && quantity <= 1000, // liters
    isValidPrice: (price) => price > 0 && price <= 10, // per liter
    isValidFuelLevel: (level) => level >= 0 && level <= 100
  },
  
  // Maintenance validation
  maintenance: {
    isValidCost: (cost) => cost >= 0 && cost <= 100000,
    isValidDuration: (duration) => duration > 0 && duration <= 720, // hours
    isValidStatus: (status) => ['scheduled', 'in-progress', 'completed', 'cancelled', 'postponed', 'overdue'].includes(status)
  },
  
  // Alert validation
  alert: {
    isValidSeverity: (severity) => ['info', 'low', 'medium', 'high', 'critical'].includes(severity),
    isValidStatus: (status) => ['active', 'acknowledged', 'resolved', 'dismissed', 'expired'].includes(status),
    isValidType: (type) => ['vehicle', 'driver', 'trip', 'maintenance', 'fuel', 'safety', 'security', 'system', 'compliance', 'performance', 'other'].includes(type)
  }
};

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

// Model aggregation pipelines
export const aggregationPipelines = {
  // Vehicle statistics
  vehicleStats: () => [
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgYear: { $avg: '$year' }
      }
    }
  ],
  
  // Driver statistics
  driverStats: () => [
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgAge: { 
          $avg: { 
            $divide: [
              { $subtract: [new Date(), '$dateOfBirth'] },
              365.25 * 24 * 60 * 60 * 1000
            ]
          }
        }
      }
    }
  ],
  
  // Trip statistics
  tripStats: (startDate, endDate) => [
    {
      $match: {
        'schedule.plannedStart': {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalDistance: { $sum: '$route.actualDistance.value' },
        totalCost: { $sum: '$costs.total' }
      }
    }
  ],
  
  // Fuel consumption analysis
  fuelAnalysis: (vehicleId, startDate, endDate) => [
    {
      $match: {
        vehicle: vehicleId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
        totalQuantity: { $sum: '$quantity.amount' },
        totalCost: { $sum: '$cost.totalAmount' },
        avgEfficiency: { $avg: '$efficiency.kpl' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ],
  
  // Maintenance cost analysis
  maintenanceCosts: (vehicleId, startDate, endDate) => [
    {
      $match: {
        vehicle: vehicleId,
        status: 'completed',
        scheduledDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$type',
        totalCost: { $sum: '$costs.total' },
        avgCost: { $avg: '$costs.total' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalCost: -1 } }
  ]
};

// Initialize database setup
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing database setup...');
    
    setupModelRelationships();
    setupDatabaseConstraints();
    
    console.log('✅ Database initialization completed');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

// Default export
export default {
  User,
  Vehicle,
  Driver,
  Trip,
  Location,
  FuelLog,
  Maintenance,
  Alert,
  setupModelRelationships,
  setupDatabaseConstraints,
  validateModelData,
  dbUtils,
  aggregationPipelines,
  initializeDatabase
};
