import express from 'express';
import { Alert, Vehicle, Driver, Trip } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { commonValidations } from '../middleware/validation.js';

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
        vehicle,
        driver,
        acknowledged
      } = req.query;

      // Build filter object
      let filter = {};
      
      // Role-based filtering
      if (req.user.role === 'driver') {
        filter.driver = req.user._id;
      }
      
      if (status) filter.status = status;
      if (severity) filter.severity = severity;
      if (type) filter.type = type;
      if (vehicle) filter.vehicle = vehicle;
      if (driver && req.user.role !== 'driver') filter.driver = driver;
      if (acknowledged !== undefined) filter['acknowledgment.acknowledged'] = acknowledged === 'true';

      // Build sort object
      const sortOrder = sort === 'desc' ? -1 : 1;
      const sortObj = { [sortBy]: sortOrder };

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const [alerts, total] = await Promise.all([
        Alert.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('vehicle', 'plateNumber make model type')
          .populate('driver', 'firstName lastName email')
          .populate('trip', 'tripNumber purpose')
          .populate('user', 'firstName lastName email')
          .populate('acknowledgment.acknowledgedBy', 'firstName lastName email')
          .populate('resolution.resolvedBy', 'firstName lastName email'),
        Alert.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          alerts,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalAlerts: total,
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
      let filter = { status: 'active' };
      
      // Role-based filtering
      if (req.user.role === 'driver') {
        filter.driver = req.user._id;
      }

      const alerts = await Alert.find(filter)
        .populate('vehicle', 'plateNumber make model')
        .populate('driver', 'firstName lastName')
        .populate('trip', 'tripNumber purpose')
        .sort({ severity: -1, createdAt: -1 })
        .limit(50);

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

// @route   GET /api/alerts/unacknowledged
// @desc    Get unacknowledged alerts
// @access  Private (Admin, Dispatcher)
router.get('/unacknowledged',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const alerts = await Alert.findUnacknowledged()
        .populate('vehicle', 'plateNumber make model')
        .populate('driver', 'firstName lastName')
        .populate('trip', 'tripNumber purpose')
        .limit(100);

      res.json({
        success: true,
        data: { alerts }
      });

    } catch (error) {
      console.error('Get unacknowledged alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching unacknowledged alerts'
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

      const alert = await Alert.findById(id)
        .populate('vehicle', 'plateNumber make model type status')
        .populate('driver', 'firstName lastName email phone')
        .populate('trip', 'tripNumber purpose route')
        .populate('user', 'firstName lastName email')
        .populate('acknowledgment.acknowledgedBy', 'firstName lastName email')
        .populate('resolution.resolvedBy', 'firstName lastName email')
        .populate('escalatedTo', 'firstName lastName email')
        .populate('relatedAlerts')
        .populate('parentAlert');

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      // Check permissions
      if (req.user.role === 'driver' && alert.driver && alert.driver._id.toString() !== req.user._id.toString()) {
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
        createdBy: req.user._id
      };

      // Validate related entities if provided
      if (alertData.vehicle) {
        const vehicle = await Vehicle.findById(alertData.vehicle);
        if (!vehicle) {
          return res.status(404).json({
            success: false,
            message: 'Vehicle not found'
          });
        }
      }

      if (alertData.driver) {
        const driver = await Driver.findById(alertData.driver);
        if (!driver) {
          return res.status(404).json({
            success: false,
            message: 'Driver not found'
          });
        }
      }

      if (alertData.trip) {
        const trip = await Trip.findById(alertData.trip);
        if (!trip) {
          return res.status(404).json({
            success: false,
            message: 'Trip not found'
          });
        }
      }

      const alert = new Alert(alertData);
      await alert.save();

      const populatedAlert = await Alert.findById(alert._id)
        .populate('vehicle', 'plateNumber make model')
        .populate('driver', 'firstName lastName email')
        .populate('trip', 'tripNumber purpose')
        .populate('createdBy', 'firstName lastName email');

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

      const alert = await Alert.findById(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      // Check permissions
      if (req.user.role === 'driver' && alert.driver && alert.driver.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied.'
        });
      }

      if (alert.acknowledgment.acknowledged) {
        return res.status(400).json({
          success: false,
          message: 'Alert is already acknowledged'
        });
      }

      await alert.acknowledge(req.user._id, note);

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

      const alert = await Alert.findById(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      if (alert.resolution.resolved) {
        return res.status(400).json({
          success: false,
          message: 'Alert is already resolved'
        });
      }

      await alert.resolve(req.user._id, note, action);

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

      const alert = await Alert.findById(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      await alert.dismiss(req.user._id);

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

// @route   GET /api/alerts/vehicle/:vehicleId
// @desc    Get alerts for a specific vehicle
// @access  Private (Admin, Dispatcher, or assigned driver)
router.get('/vehicle/:vehicleId',
  authenticate,
  async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const { status } = req.query;

      // Check permissions for drivers
      if (req.user.role === 'driver') {
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle || vehicle.assignedDriver?.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You can only view alerts for your assigned vehicle.'
          });
        }
      }

      const alerts = await Alert.findByVehicle(vehicleId, status)
        .populate('driver', 'firstName lastName')
        .populate('trip', 'tripNumber purpose');

      res.json({
        success: true,
        data: { alerts }
      });

    } catch (error) {
      console.error('Get vehicle alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vehicle alerts'
      });
    }
  }
);

// @route   GET /api/alerts/driver/:driverId
// @desc    Get alerts for a specific driver
// @access  Private (Admin, Dispatcher, or own alerts)
router.get('/driver/:driverId',
  authenticate,
  async (req, res) => {
    try {
      const { driverId } = req.params;
      const { status } = req.query;

      // Check permissions
      if (req.user.role === 'driver' && driverId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own alerts.'
        });
      }

      const alerts = await Alert.findByDriver(driverId, status)
        .populate('vehicle', 'plateNumber make model')
        .populate('trip', 'tripNumber purpose');

      res.json({
        success: true,
        data: { alerts }
      });

    } catch (error) {
      console.error('Get driver alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching driver alerts'
      });
    }
  }
);

// @route   GET /api/alerts/stats/overview
// @desc    Get alert statistics overview
// @access  Private (Admin, Dispatcher)
router.get('/stats/overview',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let matchStage = {};
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
      }

      const stats = await Alert.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalAlerts: { $sum: 1 },
            activeAlerts: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            acknowledgedAlerts: { $sum: { $cond: ['$acknowledgment.acknowledged', 1, 0] } },
            resolvedAlerts: { $sum: { $cond: ['$resolution.resolved', 1, 0] } },
            criticalAlerts: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
            highAlerts: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
            mediumAlerts: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
            lowAlerts: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } },
            avgTimeToAcknowledgment: { $avg: '$timeToAcknowledgment' },
            avgTimeToResolution: { $avg: '$timeToResolution' }
          }
        }
      ]);

      const overview = stats[0] || {
        totalAlerts: 0,
        activeAlerts: 0,
        acknowledgedAlerts: 0,
        resolvedAlerts: 0,
        criticalAlerts: 0,
        highAlerts: 0,
        mediumAlerts: 0,
        lowAlerts: 0,
        avgTimeToAcknowledgment: 0,
        avgTimeToResolution: 0
      };

      res.json({
        success: true,
        data: { overview }
      });

    } catch (error) {
      console.error('Get alert stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching alert statistics'
      });
    }
  }
);

export default router;
