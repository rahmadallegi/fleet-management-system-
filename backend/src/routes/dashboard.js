import express from 'express';
import { Op, fn, col } from 'sequelize';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import FuelLog from '../models/FuelLog.js';
import Maintenance from '../models/Maintenance.js';
import Alert from '../models/Alert.js';

const router = express.Router();

// TEST DATABASE
router.get('/test', async (req, res) => {
  try {
    console.log('🔍 Testing dashboard database connection...');

    const vehicleCount = await Vehicle.count();
    console.log(`📊 Vehicle count: ${vehicleCount}`);

    const vehicles = await Vehicle.findAll({ limit: 2 });
    console.log('🚗 Sample vehicles:', vehicles.map(v => ({ plateNumber: v.plateNumber, status: v.status })));

    res.json({
      success: true,
      data: {
        vehicleCount,
        sampleVehicles: vehicles.map(v => ({ plateNumber: v.plateNumber, status: v.status }))
      }
    });
  } catch (error) {
    console.error('❌ Dashboard test error:', error);
    res.status(500).json({ success: false, message: 'Dashboard test failed', error: error.message });
  }
});

// DASHBOARD OVERVIEW
router.get('/overview', async (req, res) => {
  try {
    // Vehicle stats
    const totalVehicles = await Vehicle.count();
    const activeVehicles = await Vehicle.count({ where: { status: 'active' } });

    // Driver stats
    const totalDrivers = await Driver.count();
    const activeDrivers = await Driver.count({ where: { status: 'active' } });

    // Trip stats
    const activeTrips = await Trip.count({ where: { status: 'in-progress' } });
    const completedTrips = await Trip.count({ where: { status: 'completed' } });

    // Fuel stats
    const fuelStats = await FuelLog.findAll({
      attributes: [
        [fn('SUM', col('totalAmount')), 'totalCost'],
        [fn('SUM', col('quantity')), 'totalQuantity']
      ]
    });
    const totalCost = fuelStats[0].dataValues.totalCost || 0;
    const totalQuantity = fuelStats[0].dataValues.totalQuantity || 0;

    // Maintenance stats
    const overdueRecords = await Maintenance.count({
      where: {
        status: 'scheduled',
        scheduledDate: { [Op.lt]: new Date() }
      }
    });
    const scheduledRecords = await Maintenance.count({ where: { status: 'scheduled' } });

    // Alerts
    const activeAlerts = await Alert.count({ where: { status: 'active' } });

    res.json({
      success: true,
      data: {
        overview: {
          vehicles: { totalVehicles, activeVehicles, inactiveVehicles: totalVehicles - activeVehicles },
          drivers: { totalDrivers, activeDrivers, inactiveDrivers: totalDrivers - activeDrivers },
          trips: { activeTrips, completedTrips, totalTrips: activeTrips + completedTrips },
          fuel: { totalCost, totalQuantity },
          maintenance: { overdueRecords, scheduledRecords, totalRecords: overdueRecords + scheduledRecords },
          alerts: { activeAlerts }
        }
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard overview', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// DASHBOARD ACTIVITY
router.get('/activity', async (req, res) => {
  try {
    // Active trips
    const activeTrips = await Trip.findAll({
      where: { status: 'in-progress' },
      include: [
        { model: Vehicle, attributes: ['plateNumber', 'make', 'model'] },
        { model: Driver, attributes: ['firstName', 'lastName'] }
      ],
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    // Overdue maintenance
    const overdueMaintenances = await Maintenance.findAll({
      where: { status: 'scheduled', scheduledDate: { [Op.lt]: new Date() } },
      include: [{ model: Vehicle, attributes: ['plateNumber', 'make', 'model'] }],
      limit: 5,
      order: [['scheduledDate', 'ASC']]
    });

    // Active alerts
    const activeAlerts = await Alert.findAll({
      where: { status: 'active' },
      include: [
        { model: Vehicle, attributes: ['plateNumber', 'make', 'model'] },
        { model: Driver, attributes: ['firstName', 'lastName'] }
      ],
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: { activeTrips, overdueMaintenances, activeAlerts } });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard activity', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

export default router;

