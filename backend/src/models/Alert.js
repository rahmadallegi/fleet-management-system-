import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Alert = sequelize.define('Alert', {
  alertId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM(
      'vehicle', 'driver', 'trip', 'maintenance', 'fuel', 'safety',
      'security', 'system', 'compliance', 'performance', 'other'
    ),
    allowNull: false,
  },
  subType: {
    type: DataTypes.ENUM(
      'vehicle-breakdown', 'vehicle-accident', 'vehicle-theft', 'vehicle-maintenance-due',
      'vehicle-inspection-due', 'vehicle-registration-expiry', 'vehicle-insurance-expiry',
      'driver-license-expiry', 'driver-medical-expiry', 'driver-violation', 'driver-absence',
      'driver-overtime', 'driver-fatigue', 'driver-performance',
      'trip-delay', 'trip-route-deviation', 'trip-emergency', 'trip-completion',
      'trip-cancellation', 'trip-no-show',
      'speeding', 'harsh-braking', 'harsh-acceleration', 'seatbelt', 'phone-usage',
      'drowsiness', 'distraction',
      'low-fuel', 'fuel-theft', 'excessive-consumption', 'fuel-card-misuse',
      'gps-offline', 'device-malfunction', 'communication-loss', 'battery-low',
      'system-error', 'data-sync-failure',
      'geofence-entry', 'geofence-exit', 'unauthorized-usage', 'custom'
    ),
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('info', 'low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  data: {
    type: DataTypes.JSON,
  },
  status: {
    type: DataTypes.ENUM('active', 'acknowledged', 'resolved', 'dismissed', 'expired'),
    defaultValue: 'active',
  },
  acknowledgment: {
    type: DataTypes.JSON,
  },
  resolution: {
    type: DataTypes.JSON,
  },
  notifications: {
    type: DataTypes.JSON,
  },
  escalation: {
    type: DataTypes.JSON,
  },
  expiresAt: {
    type: DataTypes.DATE,
  },
  recurrence: {
    type: DataTypes.JSON,
  },
  source: {
    type: DataTypes.ENUM('system', 'device', 'user', 'api', 'scheduled'),
    defaultValue: 'system',
  },
  tags: {
    type: DataTypes.JSON,
  },
  relatedAlerts: {
    type: DataTypes.JSON,
  },
});

export default Alert;