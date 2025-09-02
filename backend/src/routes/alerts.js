import express from 'express';
import models from '../models/index.js';
const { Alert, Vehicle, Driver, Trip, User } = models;
import { authenticate, authorize } from '../middleware/auth.js';
import { commonValidations } from '../middleware/validation.js';
import { Op } from 'sequelize';

const router = express.Router();

// Helper: build filters
const buildAlertFilters = (query, user) => {
  const { status, severity, type, vehicleId, driverId, acknowledged } = query;
  let where = {};

  if (user.role === 'driver') where.driverId = user.id;
  if (status) where.status = status;
  if (severity) where.severity = severity;
  if (type) where.type = type;
  if (vehicleId) where.vehicleId = vehicleId;
  if (driverId && user.role !== 'driver') where.driverId = driverId;
  if (acknowledged !== undefined) where.acknowledged = acknowledged === 'true'; // SQL column, not nested object

  return where;
};

// GET /api/alerts
router.get('/', authenticate, commonValidations.pagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'desc', sortBy = 'createdAt' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = buildAlertFilters(req.query, req.user);

    const { count, rows: alerts } = await Alert.findAndCountAll({
      where,
      order: [[sortBy, sort.toUpperCase()]],
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

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalAlerts: count,
          hasNextPage: parseInt(page) < Math.ceil(count / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit),
        }
      }
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, message: 'Error fetching alerts' });
  }
});

// GET /api/alerts/active
router.get('/active', authenticate, async (req, res) => {
  try {
    const where = { status: 'active' };
    if (req.user.role === 'driver') where.driverId = req.user.id;

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

    res.json({ success: true, data: { alerts } });
  } catch (error) {
    console.error('Get active alerts error:', error);
    res.status(500).json({ success: false, message: 'Error fetching active alerts' });
  }
});

// GET /api/alerts/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type', 'status'] },
        { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'email', 'phone'] },
        { model: Trip, as: 'trip', attributes: ['tripNumber', 'purpose', 'route'] },
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        { model: User, as: 'acknowledgedBy', attributes: ['firstName', 'lastName', 'email'] },
        { model: User, as: 'resolvedBy', attributes: ['firstName', 'lastName', 'email'] },
      ]
    });

    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    if (req.user.role === 'driver' && alert.driverId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own alerts.' });
    }

    res.json({ success: true, data: { alert } });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({ success: false, message: 'Error fetching alert' });
  }
});

// POST /api/alerts
router.post('/', authenticate, authorize('admin', 'dispatcher'), async (req, res) => {
  try {
    const alertData = { ...req.body, createdById: req.user.id };

    // Validate foreign keys
    if (alertData.vehicleId && !(await Vehicle.findByPk(alertData.vehicleId))) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    if (alertData.driverId && !(await Driver.findByPk(alertData.driverId))) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    if (alertData.tripId && !(await Trip.findByPk(alertData.tripId))) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
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

    res.status(201).json({ success: true, message: 'Alert created successfully', data: { alert: populatedAlert } });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ success: false, message: 'Error creating alert' });
  }
});

// PUT /api/alerts/:id/acknowledge
router.put('/:id/acknowledge', authenticate, async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    if (req.user.role === 'driver' && alert.driverId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (alert.acknowledged) return res.status(400).json({ success: false, message: 'Alert already acknowledged' });

    await alert.update({
      acknowledged: true,
      acknowledgedById: req.user.id,
      acknowledgedAt: new Date(),
      acknowledgmentNote: req.body.note,
      status: 'acknowledged'
    });

    res.json({ success: true, message: 'Alert acknowledged successfully' });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({ success: false, message: 'Error acknowledging alert' });
  }
});

// PUT /api/alerts/:id/resolve
router.put('/:id/resolve', authenticate, authorize('admin', 'dispatcher'), async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    if (alert.resolved) return res.status(400).json({ success: false, message: 'Alert already resolved' });

    await alert.update({
      resolved: true,
      resolvedById: req.user.id,
      resolvedAt: new Date(),
      resolutionNote: req.body.note,
      resolutionAction: req.body.action || 'no-action',
      status: 'resolved'
    });

    res.json({ success: true, message: 'Alert resolved successfully' });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ success: false, message: 'Error resolving alert' });
  }
});

// PUT /api/alerts/:id/dismiss
router.put('/:id/dismiss', authenticate, authorize('admin', 'dispatcher'), async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    await alert.update({ status: 'dismissed' });

    res.json({ success: true, message: 'Alert dismissed successfully' });
  } catch (error) {
    console.error('Dismiss alert error:', error);
    res.status(500).json({ success: false, message: 'Error dismissing alert' });
  }
});

export default router;
