import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const FuelLog = sequelize.define('FuelLog', {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.JSON,
  },
  fuelType: {
    type: DataTypes.ENUM('gasoline', 'diesel', 'premium', 'lpg', 'cng', 'electric', 'other'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.JSON,
  },
  cost: {
    type: DataTypes.JSON,
  },
  odometer: {
    type: DataTypes.JSON,
  },
  fuelLevel: {
    type: DataTypes.JSON,
  },
  payment: {
    type: DataTypes.JSON,
  },
  efficiency: {
    type: DataTypes.JSON,
  },
  fuelQuality: {
    type: DataTypes.JSON,
  },
  emissions: {
    type: DataTypes.JSON,
  },
  receipt: {
    type: DataTypes.JSON,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verifiedAt: {
    type: DataTypes.DATE,
  },
  approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  approvedAt: {
    type: DataTypes.DATE,
  },
  reimbursement: {
    type: DataTypes.JSON,
  },
  notes: {
    type: DataTypes.TEXT,
  },
});

export default FuelLog;