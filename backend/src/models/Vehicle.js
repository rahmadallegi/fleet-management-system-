import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Vehicle = sequelize.define('Vehicle', {
  plateNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  vin: {
    type: DataTypes.STRING,
    unique: true,
  },
  make: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.ENUM('car', 'truck', 'van', 'motorcycle', 'bus', 'trailer', 'other'),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('passenger', 'cargo', 'service', 'emergency', 'construction', 'other'),
    defaultValue: 'passenger',
  },
  engine: {
    type: DataTypes.JSON,
  },
  transmission: {
    type: DataTypes.ENUM('manual', 'automatic', 'cvt', 'other'),
    defaultValue: 'manual',
  },
  fuelType: {
    type: DataTypes.ENUM('gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng', 'other'),
    allowNull: false,
  },
  capacity: {
    type: DataTypes.JSON,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'repair', 'retired', 'sold'),
    defaultValue: 'active',
  },
  availability: {
    type: DataTypes.ENUM('available', 'in-use', 'maintenance', 'out-of-service'),
    defaultValue: 'available',
  },
  purchaseInfo: {
    type: DataTypes.JSON,
  },
  registration: {
    type: DataTypes.JSON,
  },
  insurance: {
    type: DataTypes.JSON,
  },
  odometer: {
    type: DataTypes.JSON,
  },
  gpsDevice: {
    type: DataTypes.JSON,
  },
  documents: {
    type: DataTypes.JSON,
  },
  images: {
    type: DataTypes.JSON,
  },
  notes: {
    type: DataTypes.TEXT,
  },
});

export default Vehicle;