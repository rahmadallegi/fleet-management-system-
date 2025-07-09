import express from 'express';
import { FuelLog, Vehicle, Driver, Trip } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { fuelValidations, commonValidations } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/fuel
// @desc    Get all fuel logs with pagination and filtering
// @access  Private (Admin, Dispatcher, Driver - limited to own logs)
router.get('/',
  authenticate,
  commonValidations.pagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'desc',
        sortBy = 'date',
        vehicle,
        driver,
        startDate,
        endDate,
        fuelType
      } = req.query;

      // Build filter object
      let filter = {};
      
      // Role-based filtering
      if (req.user.role === 'driver') {
        filter.driver = req.user._id;
      }
      
      if (vehicle) filter.vehicle = vehicle;
      if (driver && req.user.role !== 'driver') filter.driver = driver;
      if (fuelType) filter.fuelType = fuelType;
      
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }

      // Build sort object
      const sortOrder = sort === 'desc' ? -1 : 1;
      const sortObj = { [sortBy]: sortOrder };

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const [fuelLogs, total] = await Promise.all([
        FuelLog.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('vehicle', 'plateNumber make model type')
          .populate('driver', 'firstName lastName email')
          .populate('trip', 'tripNumber purpose')
          .populate('createdBy', 'firstName lastName email'),
        FuelLog.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          fuelLogs,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalLogs: total,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get fuel logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching fuel logs'
      });
    }
  }
);

// @route   GET /api/fuel/:id
// @desc    Get fuel log by ID
// @access  Private (Admin, Dispatcher, or driver who created the log)
router.get('/:id',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;

      const fuelLog = await FuelLog.findById(id)
        .populate('vehicle', 'plateNumber make model type')
        .populate('driver', 'firstName lastName email phone')
        .populate('trip', 'tripNumber purpose route')
        .populate('createdBy', 'firstName lastName email')
        .populate('verifiedBy', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName email');

      if (!fuelLog) {
        return res.status(404).json({
          success: false,
          message: 'Fuel log not found'
        });
      }

      // Check permissions
      if (req.user.role === 'driver' && fuelLog.driver._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own fuel logs.'
        });
      }

      res.json({
        success: true,
        data: { fuelLog }
      });

    } catch (error) {
      console.error('Get fuel log error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching fuel log'
      });
    }
  }
);

// @route   POST /api/fuel
// @desc    Create new fuel log
// @access  Private (Admin, Dispatcher, Driver)
router.post('/',
  authenticate,
  fuelValidations.create,
  async (req, res) => {
    try {
      const fuelData = {
        ...req.body,
        createdBy: req.user._id
      };

      // If driver is creating the log, ensure they can only create for themselves
      if (req.user.role === 'driver') {
        fuelData.driver = req.user._id;
      }

      // Validate vehicle exists
      const vehicle = await Vehicle.findById(fuelData.vehicle);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      // Validate driver exists
      const driver = await Driver.findById(fuelData.driver);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      // Validate trip if provided
      if (fuelData.trip) {
        const trip = await Trip.findById(fuelData.trip);
        if (!trip) {
          return res.status(404).json({
            success: false,
            message: 'Trip not found'
          });
        }

        // Ensure trip belongs to the same vehicle and driver
        if (trip.vehicle.toString() !== fuelData.vehicle || trip.driver.toString() !== fuelData.driver) {
          return res.status(400).json({
            success: false,
            message: 'Trip does not match the specified vehicle and driver'
          });
        }
      }

      const fuelLog = new FuelLog(fuelData);
      await fuelLog.save();

      const populatedFuelLog = await FuelLog.findById(fuelLog._id)
        .populate('vehicle', 'plateNumber make model')
        .populate('driver', 'firstName lastName email')
        .populate('trip', 'tripNumber purpose')
        .populate('createdBy', 'firstName lastName email');

      res.status(201).json({
        success: true,
        message: 'Fuel log created successfully',
        data: { fuelLog: populatedFuelLog }
      });

    } catch (error) {
      console.error('Create fuel log error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating fuel log'
      });
    }
  }
);

// @route   PUT /api/fuel/:id
// @desc    Update fuel log
// @access  Private (Admin, Dispatcher, or driver who created it)
router.put('/:id',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const fuelLog = await FuelLog.findById(id);
      if (!fuelLog) {
        return res.status(404).json({
          success: false,
          message: 'Fuel log not found'
        });
      }

      // Check permissions
      const isCreator = fuelLog.createdBy.toString() === req.user._id.toString();
      const isAuthorized = ['admin', 'dispatcher'].includes(req.user.role) || isCreator;

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Access denied.'
        });
      }

      // Prevent updates if already verified/approved (unless admin)
      if ((fuelLog.verified || fuelLog.approved) && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update verified or approved fuel log'
        });
      }

      updates.updatedBy = req.user._id;
      const updatedFuelLog = await FuelLog.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      )
        .populate('vehicle', 'plateNumber make model')
        .populate('driver', 'firstName lastName email')
        .populate('trip', 'tripNumber purpose')
        .populate('updatedBy', 'firstName lastName email');

      res.json({
        success: true,
        message: 'Fuel log updated successfully',
        data: { fuelLog: updatedFuelLog }
      });

    } catch (error) {
      console.error('Update fuel log error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating fuel log'
      });
    }
  }
);

// @route   PUT /api/fuel/:id/verify
// @desc    Verify fuel log
// @access  Private (Admin, Dispatcher)
router.put('/:id/verify',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const fuelLog = await FuelLog.findById(id);
      if (!fuelLog) {
        return res.status(404).json({
          success: false,
          message: 'Fuel log not found'
        });
      }

      fuelLog.verified = true;
      fuelLog.verifiedBy = req.user._id;
      fuelLog.verifiedAt = new Date();
      fuelLog.updatedBy = req.user._id;

      await fuelLog.save();

      res.json({
        success: true,
        message: 'Fuel log verified successfully'
      });

    } catch (error) {
      console.error('Verify fuel log error:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying fuel log'
      });
    }
  }
);

// @route   PUT /api/fuel/:id/approve
// @desc    Approve fuel log for reimbursement
// @access  Private (Admin only)
router.put('/:id/approve',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reimbursementAmount } = req.body;

      const fuelLog = await FuelLog.findById(id);
      if (!fuelLog) {
        return res.status(404).json({
          success: false,
          message: 'Fuel log not found'
        });
      }

      if (!fuelLog.verified) {
        return res.status(400).json({
          success: false,
          message: 'Fuel log must be verified before approval'
        });
      }

      fuelLog.approved = true;
      fuelLog.approvedBy = req.user._id;
      fuelLog.approvedAt = new Date();
      
      if (reimbursementAmount !== undefined) {
        fuelLog.reimbursement.amount = reimbursementAmount;
        fuelLog.reimbursement.requested = true;
        fuelLog.reimbursement.status = 'approved';
      }
      
      fuelLog.updatedBy = req.user._id;

      await fuelLog.save();

      res.json({
        success: true,
        message: 'Fuel log approved successfully'
      });

    } catch (error) {
      console.error('Approve fuel log error:', error);
      res.status(500).json({
        success: false,
        message: 'Error approving fuel log'
      });
    }
  }
);

// @route   GET /api/fuel/vehicle/:vehicleId/efficiency
// @desc    Get fuel efficiency for a vehicle
// @access  Private (Admin, Dispatcher)
router.get('/vehicle/:vehicleId/efficiency',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const { startDate, endDate } = req.query;

      const efficiency = await FuelLog.getAverageEfficiency(vehicleId, startDate, endDate);

      res.json({
        success: true,
        data: { efficiency: efficiency[0] || { avgKpl: 0, avgMpg: 0 } }
      });

    } catch (error) {
      console.error('Get fuel efficiency error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching fuel efficiency'
      });
    }
  }
);

// @route   GET /api/fuel/stats/overview
// @desc    Get fuel statistics overview
// @access  Private (Admin, Dispatcher)
router.get('/stats/overview',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let matchStage = {};
      if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = new Date(startDate);
        if (endDate) matchStage.date.$lte = new Date(endDate);
      }

      const stats = await FuelLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalLogs: { $sum: 1 },
            totalQuantity: { $sum: '$quantity.amount' },
            totalCost: { $sum: '$cost.totalAmount' },
            avgPricePerUnit: { $avg: '$cost.pricePerUnit' },
            avgEfficiency: { $avg: '$efficiency.kpl' },
            verifiedLogs: { $sum: { $cond: ['$verified', 1, 0] } },
            approvedLogs: { $sum: { $cond: ['$approved', 1, 0] } }
          }
        }
      ]);

      const overview = stats[0] || {
        totalLogs: 0,
        totalQuantity: 0,
        totalCost: 0,
        avgPricePerUnit: 0,
        avgEfficiency: 0,
        verifiedLogs: 0,
        approvedLogs: 0
      };

      res.json({
        success: true,
        data: { overview }
      });

    } catch (error) {
      console.error('Get fuel stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching fuel statistics'
      });
    }
  }
);

export default router;
