import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Driver = sequelize.define('Driver', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'prefer-not-to-say'),
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.JSON,
  },
  address: {
    type: DataTypes.JSON,
  },
  emergencyContact: {
    type: DataTypes.JSON,
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  hireDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
  },
  position: {
    type: DataTypes.STRING,
  },
  salary: {
    type: DataTypes.JSON,
  },
  license: {
    type: DataTypes.JSON,
  },
  medical: {
    type: DataTypes.JSON,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'terminated', 'on-leave'),
    defaultValue: 'active',
  },
  availability: {
    type: DataTypes.ENUM('available', 'on-duty', 'off-duty', 'on-break', 'unavailable'),
    defaultValue: 'available',
  },
  performance: {
    type: DataTypes.JSON,
  },
  violations: {
    type: DataTypes.JSON,
  },
  training: {
    type: DataTypes.JSON,
  },
  documents: {
    type: DataTypes.JSON,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  notes: {
    type: DataTypes.TEXT,
  },
});

export default Driver;