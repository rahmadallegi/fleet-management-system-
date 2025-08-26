import express from 'express';
import { FuelLog, Vehicle, Driver, Trip } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { fuelValidations, commonValidations } from '../middleware/validation.js';
import { Op } from 'sequelize';

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
        vehicleId,
        driverId,
        startDate,
        endDate,
        fuelType
      } = req.query;

      // Build filter object
      let where = {};

      // Role-based filtering
      if (req.user.role === 'driver') {
        where.driverId = req.user.id;
      }

      if (vehicleId) where.vehicleId = vehicleId;
      if (driverId && req.user.role !== 'driver') where.driverId = driverId;
      if (fuelType) where.fuelType = fuelType;

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date[Op.gte] = new Date(startDate);
        if (endDate) where.date[Op.lte] = new Date(endDate);
      }

      // Build order array
      const order = [[sortBy, sort.toUpperCase()]];

      // Calculate offset
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const { count, rows: fuelLogs } = await FuelLog.findAndCountAll({
        where,
        order,
        offset,
        limit: parseInt(limit),
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'email'] },
          { model: Trip, as: 'trip', attributes: ['tripNumber', 'purpose'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      // Calculate pagination info
      const totalPages = Math.ceil(count / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          fuelLogs,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalLogs: count,
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

      const fuelLog = await FuelLog.findByPk(id, {
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'email', 'phone'] },
          { model: Trip, as: 'trip', attributes: ['tripNumber', 'purpose', 'route'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'verifiedBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'approvedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      if (!fuelLog) {
        return res.status(404).json({
          success: false,
          message: 'Fuel log not found'
        });
      }

      // Check permissions
      if (req.user.role === 'driver' && fuelLog.driverId.toString() !== req.user.id.toString()) {
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
        createdById: req.user.id
      };

      // If driver is creating the log, ensure they can only create for themselves
      if (req.user.role === 'driver') {
        fuelData.driverId = req.user.id;
      }

      // Validate vehicle exists
      const vehicle = await Vehicle.findByPk(fuelData.vehicleId);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      // Validate driver exists
      const driver = await Driver.findByPk(fuelData.driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      // Validate trip if provided
      if (fuelData.tripId) {
        const trip = await Trip.findByPk(fuelData.tripId);
        if (!trip) {
          return res.status(404).json({
            success: false,
            message: 'Trip not found'
          });
        }

        // Ensure trip belongs to the same vehicle and driver
        if (trip.vehicleId.toString() !== fuelData.vehicleId || trip.driverId.toString() !== fuelData.driverId) {
          return res.status(400).json({
            success: false,
            message: 'Trip does not match the specified vehicle and driver'
          });
        }
      }

      const fuelLog = await FuelLog.create(fuelData);

      const populatedFuelLog = await FuelLog.findByPk(fuelLog.id, {
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'email'] },
          { model: Trip, as: 'trip', attributes: ['tripNumber', 'purpose'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

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

      const fuelLog = await FuelLog.findByPk(id);
      if (!fuelLog) {
        return res.status(404).json({
          success: false,
          message: 'Fuel log not found'
        });
      }

      // Check permissions
      const isCreator = fuelLog.createdById.toString() === req.user.id.toString();
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

      updates.updatedById = req.user.id;
      await fuelLog.update(updates);

      const updatedFuelLog = await FuelLog.findByPk(id, {
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'email'] },
          { model: Trip, as: 'trip', attributes: ['tripNumber', 'purpose'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

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

      const fuelLog = await FuelLog.findByPk(id);
      if (!fuelLog) {
        return res.status(404).json({
          success: false,
          message: 'Fuel log not found'
        });
      }

      await fuelLog.update({
        verified: true,
        verifiedById: req.user.id,
        verifiedAt: new Date(),
        updatedById: req.user.id
      });

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

      const fuelLog = await FuelLog.findByPk(id);
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

      const updates = {
        approved: true,
        approvedById: req.user.id,
        approvedAt: new Date(),
        updatedById: req.user.id
      };

      if (reimbursementAmount !== undefined) {
        updates.reimbursement = {
          ...fuelLog.reimbursement,
          amount: reimbursementAmount,
          requested: true,
          status: 'approved'
        };
      }

      await fuelLog.update(updates);

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

export default router;