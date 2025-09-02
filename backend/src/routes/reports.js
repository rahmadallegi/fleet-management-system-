import express from 'express';
import { FuelLog, Vehicle, Driver } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { Op, fn, col } from 'sequelize';

const router = express.Router();

// @route   GET /api/reports/fuel
// @desc    Get fuel consumption report (vehicle & driver level)
// @access  Private
router.get('/fuel', authenticate, async (req, res) => {
  try {
    const {
      vehicleId,
      driverId,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      groupBy = 'vehicle' // 'vehicle' or 'driver'
    } = req.query;

    // Build filter
    const where = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (driverId) where.driverId = driverId;
    if (startDate) where.date = { [Op.gte]: new Date(startDate) };
    if (endDate) where.date = { ...(where.date || {}), [Op.lte]: new Date(endDate) };

    // Determine grouping
    const include = [];
    const group = [];
    let reportFields = [];

    if (groupBy === 'driver') {
      include.push({
        model: Driver,
        as: 'driver',
        attributes: ['id', 'firstName', 'lastName', 'email']
      });
      group.push('driverId', 'driver.id', 'driver.firstName', 'driver.lastName', 'driver.email');
      reportFields = ['driver'];
    } else {
      // default group by vehicle
      include.push({
        model: Vehicle,
        as: 'vehicle',
        attributes: ['id', 'plateNumber', 'make', 'model']
      });
      group.push('vehicleId', 'vehicle.id', 'vehicle.plateNumber', 'vehicle.make', 'vehicle.model');
      reportFields = ['vehicle'];
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const logs = await FuelLog.findAll({
      where,
      include,
      attributes: [
        ...(reportFields.includes('vehicle') ? ['vehicleId'] : ['driverId']),
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [fn('SUM', col('cost')), 'totalCost'],
        [fn('AVG', col('kpl')), 'avgKpl'],
        [fn('AVG', col('mpg')), 'avgMpg']
      ],
      group,
      offset,
      limit: parseInt(limit),
      order: [[fn('SUM', col('cost')), 'DESC']] // optional: sort by total cost
    });

    // Build report
    const report = logs.map(log => {
      const vehicle = log.vehicle;
      const driver = log.driver;
      return {
        vehicle: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})` : undefined,
        driver: driver ? `${driver.firstName} ${driver.lastName} (${driver.email})` : undefined,
        totalQuantity: parseFloat(log.get('totalQuantity')) || 0,
        totalCost: parseFloat(log.get('totalCost')) || 0,
        avgKpl: parseFloat(log.get('avgKpl')) || 0,
        avgMpg: parseFloat(log.get('avgMpg')) || 0
      };
    });

    res.json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      count: report.length,
      data: report
    });
  } catch (err) {
    console.error('Fuel report error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
