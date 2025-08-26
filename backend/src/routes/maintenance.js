import express from 'express';
import { Maintenance, Vehicle } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { maintenanceValidations, commonValidations } from '../middleware/validation.js';
import { Op } from 'sequelize';

const router = express.Router();

// @route   GET /api/maintenance
// @desc    Get all maintenance records with pagination and filtering
// @access  Private (Admin, Dispatcher)
router.get('/',
  authenticate,
  authorize('admin', 'dispatcher'),
  commonValidations.pagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'desc',
        sortBy = 'scheduledDate',
        vehicleId,
        status,
        type,
        priority,
        startDate,
        endDate
      } = req.query;

      // Build filter object
      const where = {};

      if (vehicleId) where.vehicleId = vehicleId;
      if (status) where.status = status;
      if (type) where.type = type;
      if (priority) where.priority = priority;

      if (startDate || endDate) {
        where.scheduledDate = {};
        if (startDate) where.scheduledDate[Op.gte] = new Date(startDate);
        if (endDate) where.scheduledDate[Op.lte] = new Date(endDate);
      }

      // Build order array
      const order = [[sortBy, sort.toUpperCase()]];

      // Calculate offset
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const { count, rows: maintenanceRecords } = await Maintenance.findAndCountAll({
        where,
        order,
        offset,
        limit: parseInt(limit),
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type', 'status'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'approvedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      // Calculate pagination info
      const totalPages = Math.ceil(count / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          maintenanceRecords,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalRecords: count,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get maintenance records error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching maintenance records'
      });
    }
  }
);

// @route   GET /api/maintenance/:id
// @desc    Get maintenance record by ID
// @access  Private (Admin, Dispatcher)
router.get('/:id',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const maintenanceRecord = await Maintenance.findByPk(id, {
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type', 'status', 'odometer'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'approvedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      if (!maintenanceRecord) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found'
        });
      }

      res.json({
        success: true,
        data: { maintenanceRecord }
      });

    } catch (error) {
      console.error('Get maintenance record error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching maintenance record'
      });
    }
  }
);

// @route   POST /api/maintenance
// @desc    Create new maintenance record
// @access  Private (Admin, Dispatcher)
router.post('/',
  authenticate,
  authorize('admin', 'dispatcher'),
  maintenanceValidations.create,
  async (req, res) => {
    try {
      const maintenanceData = {
        ...req.body,
        createdById: req.user.id
      };

      // Validate vehicle exists
      const vehicle = await Vehicle.findByPk(maintenanceData.vehicleId);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      const maintenanceRecord = await Maintenance.create(maintenanceData);

      const populatedRecord = await Maintenance.findByPk(maintenanceRecord.id, {
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Maintenance record created successfully',
        data: { maintenanceRecord: populatedRecord }
      });

    } catch (error) {
      console.error('Create maintenance record error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating maintenance record'
      });
    }
  }
);

// @route   PUT /api/maintenance/:id
// @desc    Update maintenance record
// @access  Private (Admin, Dispatcher)
router.put('/:id',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = {
        ...req.body,
        updatedById: req.user.id
      };

      const maintenanceRecord = await Maintenance.findByPk(id);
      if (!maintenanceRecord) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found'
        });
      }

      // Prevent updates if completed (unless admin)
      if (maintenanceRecord.status === 'completed' && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update completed maintenance record'
        });
      }

      await maintenanceRecord.update(updates);

      const updatedRecord = await Maintenance.findByPk(id, {
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      res.json({
        success: true,
        message: 'Maintenance record updated successfully',
        data: { maintenanceRecord: updatedRecord }
      });

    } catch (error) {
      console.error('Update maintenance record error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating maintenance record'
      });
    }
  }
);

// @route   PUT /api/maintenance/:id/start
// @desc    Start maintenance work
// @access  Private (Admin, Dispatcher)
router.put('/:id/start',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { vehicleConditionBefore } = req.body;

      const maintenanceRecord = await Maintenance.findByPk(id);
      if (!maintenanceRecord) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found'
        });
      }

      if (maintenanceRecord.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          message: 'Maintenance cannot be started. Current status: ' + maintenanceRecord.status
        });
      }

      // Update maintenance status and start details
      await maintenanceRecord.update({
        status: 'in-progress',
        actualWork: { ...maintenanceRecord.actualWork, startDate: new Date() },
        vehicleCondition: { ...maintenanceRecord.vehicleCondition, before: vehicleConditionBefore },
        updatedById: req.user.id
      });

      // Update vehicle status to maintenance
      const vehicle = await Vehicle.findByPk(maintenanceRecord.vehicleId);
      if (vehicle) {
        await vehicle.update({
          status: 'maintenance',
          availability: 'maintenance'
        });
      }

      res.json({
        success: true,
        message: 'Maintenance work started successfully'
      });

    } catch (error) {
      console.error('Start maintenance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error starting maintenance work'
      });
    }
  }
);

// @route   PUT /api/maintenance/:id/complete
// @desc    Complete maintenance work
// @access  Private (Admin, Dispatcher)
router.put('/:id/complete',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { workPerformed, findings, recommendations, vehicleConditionAfter, inspection } = req.body;

      const maintenanceRecord = await Maintenance.findByPk(id);
      if (!maintenanceRecord) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found'
        });
      }

      if (maintenanceRecord.status !== 'in-progress') {
        return res.status(400).json({
          success: false,
          message: 'Maintenance cannot be completed. Current status: ' + maintenanceRecord.status
        });
      }

      // Update maintenance completion details
      await maintenanceRecord.update({
        status: 'completed',
        actualWork: {
          ...maintenanceRecord.actualWork,
          endDate: new Date(),
          workPerformed,
          findings,
          recommendations
        },
        vehicleCondition: { ...maintenanceRecord.vehicleCondition, after: vehicleConditionAfter },
        inspection: { ...maintenanceRecord.inspection, ...inspection },
        updatedById: req.user.id
      });

      // Update vehicle status back to active
      const vehicle = await Vehicle.findByPk(maintenanceRecord.vehicleId);
      if (vehicle) {
        await vehicle.update({
          status: 'active',
          availability: 'available'
        });
      }

      res.json({
        success: true,
        message: 'Maintenance work completed successfully'
      });

    } catch (error) {
      console.error('Complete maintenance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error completing maintenance work'
      });
    }
  }
);

// @route   PUT /api/maintenance/:id/approve
// @desc    Approve maintenance record
// @access  Private (Admin only)
router.put('/:id/approve',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;

      const maintenanceRecord = await Maintenance.findByPk(id);
      if (!maintenanceRecord) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found'
        });
      }

      await maintenanceRecord.update({
        approval: {
          ...maintenanceRecord.approval,
          approved: true,
          approvedById: req.user.id,
          approvedAt: new Date(),
          comments
        },
        updatedById: req.user.id
      });

      res.json({
        success: true,
        message: 'Maintenance record approved successfully'
      });

    } catch (error) {
      console.error('Approve maintenance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error approving maintenance record'
      });
    }
  }
);

export default router;