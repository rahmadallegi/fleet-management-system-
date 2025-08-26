import express from 'express';
import FuelLog from '../models/FuelLog.js';
import Vehicle from '../models/Vehicle.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/reports/fuel
// @desc    Get fuel consumption report
// @access  Private
router.get('/fuel', authenticate, async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.query;

    const vehicles = await Vehicle.find(vehicleId ? { _id: vehicleId } : {});
    if (!vehicles.length) {
      return res.status(404).json({ msg: 'No vehicles found' });
    }

    const report = [];

    for (const vehicle of vehicles) {
      const [totalCost, avgEfficiency] = await Promise.all([
        FuelLog.getTotalCostByVehicle(vehicle._id, startDate, endDate),
        FuelLog.getAverageEfficiency(vehicle._id, startDate, endDate),
      ]);

      report.push({
        vehicle: vehicle.displayName,
        totalCost: totalCost[0]?.totalCost || 0,
        totalQuantity: totalCost[0]?.totalQuantity || 0,
        avgKpl: avgEfficiency[0]?.avgKpl || 0,
        avgMpg: avgEfficiency[0]?.avgMpg || 0,
      });
    }

    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
