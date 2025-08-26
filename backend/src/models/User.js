import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
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
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'dispatcher', 'driver', 'viewer'),
    defaultValue: 'viewer',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  department: {
    type: DataTypes.STRING,
  },
  employeeId: {
    type: DataTypes.STRING,
    unique: true,
  },
  passwordResetToken: {
    type: DataTypes.STRING,
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
  },
  lastLogin: {
    type: DataTypes.DATE,
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lockUntil: {
    type: DataTypes.DATE,
  },
  preferences: {
    type: DataTypes.JSON,
  },
});

User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default User;