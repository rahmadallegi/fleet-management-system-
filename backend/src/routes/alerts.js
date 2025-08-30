import express from 'express';
import models from '../models/index.js';
const { Alert, Vehicle, Driver, Trip, User } = models;
import { authenticate, authorize } from '../middleware/auth.js';
import { commonValidations } from '../middleware/validation.js';
import { Op } from 'sequelize';

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get all alerts with pagination and filtering
// @access  Private (Admin, Dispatcher, Driver - limited to own alerts)
router.get('/',
  authenticate,
  commonValidations.pagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'desc',
        sortBy = 'createdAt',
        status,
        severity,
        type,
        vehicleId,
        driverId,
        acknowledged
      } = req.query;

      // Build filter object
      let where = {};

      // Role-based filtering
      if (req.user.role === 'driver') {
        where.driverId = req.user.id;
      }

      if (status) where.status = status;
      if (severity) where.severity = severity;
      if (type) where.type = type;
      if (vehicleId) where.vehicleId = vehicleId;
      if (driverId && req.user.role !== 'driver') where.driverId = driverId;
      if (acknowledged !== undefined) where['acknowledgment.acknowledged'] = acknowledged === 'true';

      // Build order array
      const order = [[sortBy, sort.toUpperCase()]];

      // Calculate offset
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const { count, rows: alerts } = await Alert.findAndCountAll({
        where,
        order,
        offset,
        limit: parseInt(limit),
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'email'] },
          { model: Trip, as: 'trip', attributes: ['tripNumber', 'purpose'] },
          { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'acknowledgedBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'resolvedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      // Calculate pagination info
      const totalPages = Math.ceil(count / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          alerts,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalAlerts: count,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching alerts'
      });
    }
  }
);

// @route   GET /api/alerts/active
// @desc    Get active alerts
// @access  Private (Admin, Dispatcher, Driver)
router.get('/active',
  authenticate,
  async (req, res) => {
    try {
      let where = { status: 'active' };

      // Role-based filtering
      if (req.user.role === 'driver') {
        where.driverId = req.user.id;
      }

      const alerts = await Alert.findAll({
        where,
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName'] },
          { model: Trip, as: 'trip', attributes: ['tripNumber', 'purpose'] },
        ],
        order: [['severity', 'DESC'], ['createdAt', 'DESC']],
        limit: 50
      });

      res.json({
        success: true,
        data: { alerts }
      });

    } catch (error) {
      console.error('Get active alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching active alerts'
      });
    }
  }
);

// @route   GET /api/alerts/:id
// @desc    Get alert by ID
// @access  Private (Admin, Dispatcher, or related driver)
router.get('/:id',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;

      const alert = await Alert.findByPk(id, {
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type', 'status'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'email', 'phone'] },
          { model: Trip, as: 'trip', attributes: ['tripNumber', 'purpose', 'route'] },
          { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'acknowledgedBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'resolvedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      // Check permissions
      if (req.user.role === 'driver' && alert.driverId && alert.driverId.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own alerts.'
        });
      }

      res.json({
        success: true,
        data: { alert }
      });

    } catch (error) {
      console.error('Get alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching alert'
      });
    }
  }
);

// @route   POST /api/alerts
// @desc    Create new alert
// @access  Private (Admin, Dispatcher, System)
router.post('/',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const alertData = {
        ...req.body,
        createdById: req.user.id
      };

      // Validate related entities if provided
      if (alertData.vehicleId) {
        const vehicle = await Vehicle.findByPk(alertData.vehicleId);
        if (!vehicle) {
          return res.status(404).json({
            success: false,
            message: 'Vehicle not found'
          });
        }
      }

      if (alertData.driverId) {
        const driver = await Driver.findByPk(alertData.driverId);
        if (!driver) {
          return res.status(404).json({
            success: false,
            message: 'Driver not found'
          });
        }
      }

      if (alertData.tripId) {
        const trip = await Trip.findByPk(alertData.tripId);
        if (!trip) {
          return res.status(404).json({
            success: false,
            message: 'Trip not found'
          });
        }
      }

      const alert = await Alert.create(alertData);

      const populatedAlert = await Alert.findByPk(alert.id, {
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'email'] },
          { model: Trip, as: 'trip', attributes: ['tripNumber', 'purpose'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Alert created successfully',
        data: { alert: populatedAlert }
      });

    } catch (error) {
      console.error('Create alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating alert'
      });
    }
  }
);

// @route   PUT /api/alerts/:id/acknowledge
// @desc    Acknowledge an alert
// @access  Private (Admin, Dispatcher, or related driver)
router.put('/:id/acknowledge',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;

      const alert = await Alert.findByPk(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      // Check permissions
      if (req.user.role === 'driver' && alert.driverId && alert.driverId.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied.'
        });
      }

      if (alert.acknowledgment && alert.acknowledgment.acknowledged) {
        return res.status(400).json({
          success: false,
          message: 'Alert is already acknowledged'
        });
      }

      await alert.update({
        acknowledgment: {
          acknowledged: true,
          acknowledgedById: req.user.id,
          acknowledgedAt: new Date(),
          acknowledgmentNote: note
        },
        status: 'acknowledged'
      });

      res.json({
        success: true,
        message: 'Alert acknowledged successfully'
      });

    } catch (error) {
      console.error('Acknowledge alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Error acknowledging alert'
      });
    }
  }
);

// @route   PUT /api/alerts/:id/resolve
// @desc    Resolve an alert
// @access  Private (Admin, Dispatcher)
router.put('/:id/resolve',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { note, action = 'no-action' } = req.body;

      const alert = await Alert.findByPk(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      if (alert.resolution && alert.resolution.resolved) {
        return res.status(400).json({
          success: false,
          message: 'Alert is already resolved'
        });
      }

      await alert.update({
        resolution: {
          resolved: true,
          resolvedById: req.user.id,
          resolvedAt: new Date(),
          resolutionNote: note,
          resolutionAction: action
        },
        status: 'resolved'
      });

      res.json({
        success: true,
        message: 'Alert resolved successfully'
      });

    } catch (error) {
      console.error('Resolve alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Error resolving alert'
      });
    }
  }
);

// @route   PUT /api/alerts/:id/dismiss
// @desc    Dismiss an alert
// @access  Private (Admin, Dispatcher)
router.put('/:id/dismiss',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const alert = await Alert.findByPk(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      await alert.update({ status: 'dismissed' });

      res.json({
        success: true,
        message: 'Alert dismissed successfully'
      });

    } catch (error) {
      console.error('Dismiss alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Error dismissing alert'
      });
    }
  }
);

export default router;