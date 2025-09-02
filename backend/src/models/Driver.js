import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
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
  phone: DataTypes.JSON,
  address: DataTypes.JSON,
  emergencyContact: DataTypes.JSON,
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  hireDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  department: DataTypes.STRING,
  position: DataTypes.STRING,
  salary: DataTypes.JSON,
  license: DataTypes.JSON,
  medical: DataTypes.JSON,
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'terminated', 'on-leave'),
    defaultValue: 'active',
  },
  availability: {
    type: DataTypes.ENUM('available', 'on-duty', 'off-duty', 'on-break', 'unavailable'),
    defaultValue: 'available',
  },
  performance: DataTypes.JSON,
  violations: DataTypes.JSON,
  training: DataTypes.JSON,
  documents: DataTypes.JSON,
  avatar: DataTypes.STRING,
  notes: DataTypes.TEXT,
}, {
  timestamps: true,   // adds createdAt & updatedAt
  tableName: 'drivers'
});

export default Driver;
