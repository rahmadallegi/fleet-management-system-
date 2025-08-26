import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Trip = sequelize.define('Trip', {
  tripNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  purpose: {
    type: DataTypes.ENUM('delivery', 'pickup', 'service', 'transport', 'maintenance', 'emergency', 'other'),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
  },
  description: {
    type: DataTypes.TEXT,
  },
  route: {
    type: DataTypes.JSON,
  },
  schedule: {
    type: DataTypes.JSON,
  },
  status: {
    type: DataTypes.ENUM('planned', 'assigned', 'in-progress', 'completed', 'cancelled', 'delayed'),
    defaultValue: 'planned',
  },
  odometer: {
    type: DataTypes.JSON,
  },
  fuel: {
    type: DataTypes.JSON,
  },
  cargo: {
    type: DataTypes.JSON,
  },
  weather: {
    type: DataTypes.JSON,
  },
  incidents: {
    type: DataTypes.JSON,
  },
  documents: {
    type: DataTypes.JSON,
  },
  completion: {
    type: DataTypes.JSON,
  },
  costs: {
    type: DataTypes.JSON,
  },
  notes: {
    type: DataTypes.TEXT,
  },
});

export default Trip;