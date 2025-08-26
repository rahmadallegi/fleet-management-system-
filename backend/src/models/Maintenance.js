import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Maintenance = sequelize.define('Maintenance', {
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
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  estimatedDuration: {
    type: DataTypes.JSON,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in-progress', 'completed', 'cancelled', 'postponed', 'overdue'),
    defaultValue: 'scheduled',
  },
  serviceProvider: {
    type: DataTypes.JSON,
  },
  workOrder: {
    type: DataTypes.JSON,
  },
  parts: {
    type: DataTypes.JSON,
  },
  labor: {
    type: DataTypes.JSON,
  },
  costs: {
    type: DataTypes.JSON,
  },
  vehicleCondition: {
    type: DataTypes.JSON,
  },
  actualWork: {
    type: DataTypes.JSON,
  },
  inspection: {
    type: DataTypes.JSON,
  },
  documents: {
    type: DataTypes.JSON,
  },
  nextMaintenance: {
    type: DataTypes.JSON,
  },
  approval: {
    type: DataTypes.JSON,
  },
  notes: {
    type: DataTypes.TEXT,
  },
});

export default Maintenance;