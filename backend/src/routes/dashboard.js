import express from 'express';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import FuelLog from '../models/FuelLog.js';
import Maintenance from '../models/Maintenance.js';
import Alert from '../models/Alert.js';

const router = express.Router();

// @route   GET /api/dashboard/test
// @desc    Test database connection and data
// @access  Public
router.get('/test', async (req, res) => {
  try {
    console.log('🔍 Testing dashboard database connection...');

    // Test vehicle count
    const vehicleCount = await Vehicle.countDocuments();
    console.log(`📊 Vehicle count: ${vehicleCount}`);

    // Get sample vehicles
    const vehicles = await Vehicle.find().limit(2);
    console.log(`🚗 Sample vehicles:`, vehicles.map(v => ({ plateNumber: v.plateNumber, status: v.status })));

    res.json({
      success: true,
      data: {
        vehicleCount,
        sampleVehicles: vehicles.map(v => ({ plateNumber: v.plateNumber, status: v.status }))
      }
    });

  } catch (error) {
    console.error('❌ Dashboard test error:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard test failed',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview statistics
// @access  Public (for testing - should be protected in production)
router.get('/overview', async (req, res) => {
  try {
    // Get vehicle statistics
    const [totalVehicles, activeVehicles] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'active' })
    ]);

    // Get driver statistics  
    const [totalDrivers, activeDrivers] = await Promise.all([
      Driver.countDocuments(),
      Driver.countDocuments({ status: 'active' })
    ]);

    // Get trip statistics
    const [activeTrips, completedTrips] = await Promise.all([
      Trip.countDocuments({ status: 'in-progress' }),
      Trip.countDocuments({ status: 'completed' })
    ]);

    // Get fuel statistics
    const fuelLogs = await FuelLog.aggregate([
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost.totalAmount' },
          totalQuantity: { $sum: '$quantity.amount' }
        }
      }
    ]);

    // Get maintenance statistics
    const [overdueRecords, scheduledRecords] = await Promise.all([
      Maintenance.countDocuments({ 
        status: 'scheduled',
        scheduledDate: { $lt: new Date() }
      }),
      Maintenance.countDocuments({ status: 'scheduled' })
    ]);

    // Get alert statistics
    const activeAlerts = await Alert.countDocuments({ status: 'active' });

    const overview = {
      vehicles: {
        totalVehicles,
        activeVehicles,
        inactiveVehicles: totalVehicles - activeVehicles
      },
      drivers: {
        totalDrivers,
        activeDrivers,
        inactiveDrivers: totalDrivers - activeDrivers
      },
      trips: {
        activeTrips,
        completedTrips,
        totalTrips: activeTrips + completedTrips
      },
      fuel: {
        totalCost: fuelLogs[0]?.totalCost || 0,
        totalQuantity: fuelLogs[0]?.totalQuantity || 0
      },
      maintenance: {
        overdueRecords,
        scheduledRecords,
        totalRecords: overdueRecords + scheduledRecords
      },
      alerts: {
        activeAlerts
      }
    };

    res.json({
      success: true,
      data: { overview }
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard overview',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/dashboard/activity
// @desc    Get recent activity for dashboard
// @access  Public (for testing - should be protected in production)
router.get('/activity', async (req, res) => {
  try {
    // Get active trips
    const activeTrips = await Trip.find({ status: 'in-progress' })
      .populate('vehicle', 'plateNumber make model')
      .populate('driver', 'firstName lastName')
      .limit(5)
      .sort({ createdAt: -1 });

    // Get overdue maintenance
    const overdueMaintenances = await Maintenance.find({
      status: 'scheduled',
      scheduledDate: { $lt: new Date() }
    })
      .populate('vehicle', 'plateNumber make model')
      .limit(5)
      .sort({ scheduledDate: 1 });

    // Get active alerts
    const activeAlerts = await Alert.find({ status: 'active' })
      .populate('vehicle', 'plateNumber make model')
      .populate('driver', 'firstName lastName')
      .limit(5)
      .sort({ createdAt: -1 });

    const activity = {
      activeTrips,
      overdueMaintenances,
      activeAlerts
    };

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
