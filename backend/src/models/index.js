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