import express from 'express';
import models from '../models/index.js';
const { Trip, Vehicle, Driver, User, sequelize } = models;
import { authenticate, authorize } from '../middleware/auth.js';
import { tripValidations, commonValidations } from '../middleware/validation.js';
import { dbUtils } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// Helper: Get trip with all associations
async function getTripWithRelations(tripId) {
  return Trip.findByPk(tripId, {
    include: [
      { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type'] },
      { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'email', 'phone'] },
      { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
      { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
    ]
  });
}

// GET /api/trips - List trips with pagination and filtering
router.get('/', authenticate, commonValidations.pagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'desc', sortBy = 'createdAt', status, vehicleId, driverId, startDate, endDate } = req.query;
    const where = {};

    if (req.user.role === 'driver') {
      where.driverId = req.user.id;
    }
    if (status) where.status = status;
    if (vehicleId) where.vehicleId = vehicleId;
    if (driverId && req.user.role !== 'driver') where.driverId = driverId;

    if (startDate || endDate) {
      where['schedule.plannedStart'] = {};
      if (startDate) where['schedule.plannedStart'][Op.gte] = new Date(startDate);
      if (endDate) where['schedule.plannedStart'][Op.lte] = new Date(endDate);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sortBy, sort.toUpperCase()]];

    const { count, rows: trips } = await Trip.findAndCountAll({
      where,
      order,
      offset,
      limit: parseInt(limit),
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type'] },
        { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'email', 'phone'] },
        { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
        { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
      ]
    });

    res.json({
      success: true,
      data: {
        trips,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalTrips: count,
          hasNextPage: parseInt(page) < Math.ceil(count / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ success: false, message: 'Error fetching trips' });
  }
});

// GET /api/trips/active - Active trips
router.get('/active', authenticate, async (req, res) => {
  try {
    const where = { status: 'in-progress' };
    if (req.user.role === 'driver') where.driverId = req.user.id;

    const trips = await Trip.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type', 'gpsDevice'] },
        { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'phone'] }
      ],
      order: [['schedule', 'plannedStart', 'ASC']]
    });

    res.json({ success: true, data: { trips } });
  } catch (error) {
    console.error('Get active trips error:', error);
    res.status(500).json({ success: false, message: 'Error fetching active trips' });
  }
});

// GET /api/trips/:id - Trip by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const trip = await getTripWithRelations(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (req.user.role === 'driver' && trip.driverId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your assigned trips.' });
    }

    res.json({ success: true, data: { trip } });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ success: false, message: 'Error fetching trip' });
  }
});

// POST /api/trips - Create trip
router.post('/', authenticate, authorize('admin', 'dispatcher'), tripValidations.create, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const tripData = { ...req.body, tripNumber: dbUtils.generateTripNumber(), createdById: req.user.id };
    const vehicle = await Vehicle.findByPk(tripData.vehicleId, { transaction: t });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    if (vehicle.status !== 'active' || vehicle.availability !== 'available') return res.status(400).json({ success: false, message: 'Vehicle not available' });

    const driver = await Driver.findByPk(tripData.driverId, { transaction: t });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    if (driver.status !== 'active' || driver.availability !== 'available') return res.status(400).json({ success: false, message: 'Driver not available' });

    const trip = await Trip.create(tripData, { transaction: t });
    await Promise.all([
      vehicle.update({ availability: 'in-use' }, { transaction: t }),
      driver.update({ availability: 'on-duty' }, { transaction: t })
    ]);

    await t.commit();
    const populatedTrip = await getTripWithRelations(trip.id);
    res.status(201).json({ success: true, message: 'Trip created successfully', data: { trip: populatedTrip } });
  } catch (error) {
    await t.rollback();
    console.error('Create trip error:', error);
    res.status(500).json({ success: false, message: 'Error creating trip' });
  }
});

// PUT /api/trips/:id - Update trip
router.put('/:id', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const isAssignedDriver = req.user.role === 'driver' && trip.driverId.toString() === req.user.id.toString();
    const isAuthorized = ['admin', 'dispatcher'].includes(req.user.role) || isAssignedDriver;
    if (!isAuthorized) return res.status(403).json({ success: false, message: 'Access denied.' });

    if (isAssignedDriver) {
      const allowedFields = ['status', 'odometer', 'fuel', 'incidents', 'notes', 'completion'];
      const restrictedFields = Object.keys(req.body).filter(f => !allowedFields.includes(f));
      if (restrictedFields.length) return res.status(403).json({ success: false, message: `You cannot update: ${restrictedFields.join(', ')}` });
    }

    await trip.update({ ...req.body, updatedById: req.user.id });
    const updatedTrip = await getTripWithRelations(trip.id);
    res.json({ success: true, message: 'Trip updated successfully', data: { trip: updatedTrip } });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ success: false, message: 'Error updating trip' });
  }
});

// PUT /api/trips/:id/start - Start trip
router.put('/:id/start', authenticate, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const trip = await Trip.findByPk(req.params.id, { transaction: t });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const isAssignedDriver = req.user.role === 'driver' && trip.driverId.toString() === req.user.id.toString();
    const isAuthorized = ['admin', 'dispatcher'].includes(req.user.role) || isAssignedDriver;
    if (!isAuthorized) return res.status(403).json({ success: false, message: 'Access denied.' });
    if (!['assigned', 'planned'].includes(trip.status)) return res.status(400).json({ success: false, message: 'Trip cannot be started. Current status: ' + trip.status });

    await trip.update({
      status: 'in-progress',
      schedule: { ...trip.schedule, actualStart: new Date() },
      odometer: { ...trip.odometer, start: req.body.odometerStart },
      fuel: { ...trip.fuel, startLevel: req.body.fuelStart },
      updatedById: req.user.id
    }, { transaction: t });

    await t.commit();
    const updatedTrip = await getTripWithRelations(trip.id);
    res.json({ success: true, message: 'Trip started successfully', data: { trip: updatedTrip } });
  } catch (error) {
    await t.rollback();
    console.error('Start trip error:', error);
    res.status(500).json({ success: false, message: 'Error starting trip' });
  }
});

// PUT /api/trips/:id/complete - Complete trip
router.put('/:id/complete', authenticate, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const trip = await Trip.findByPk(req.params.id, { transaction: t });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const isAssignedDriver = req.user.role === 'driver' && trip.driverId.toString() === req.user.id.toString();
    const isAuthorized = ['admin', 'dispatcher'].includes(req.user.role) || isAssignedDriver;
    if (!isAuthorized) return res.status(403).json({ success: false, message: 'Access denied.' });
    if (trip.status !== 'in-progress') return res.status(400).json({ success: false, message: 'Trip cannot be completed. Current status: ' + trip.status });

    await trip.update({
      status: 'completed',
      schedule: { ...trip.schedule, actualEnd: new Date() },
      odometer: { ...trip.odometer, end: req.body.odometerEnd },
      fuel: { ...trip.fuel, endLevel: req.body.fuelEnd },
      completion: { ...trip.completion, ...req.body.completion },
      updatedById: req.user.id
    }, { transaction: t });

    const vehicle = await Vehicle.findByPk(trip.vehicleId, { transaction: t });
    if (vehicle) await vehicle.update({ availability: 'available' }, { transaction: t });
    const driver = await Driver.findByPk(trip.driverId, { transaction: t });
    if (driver) await driver.update({ availability: 'available' }, { transaction: t });

    await t.commit();
    const updatedTrip = await getTripWithRelations(trip.id);
    res.json({ success: true, message: 'Trip completed successfully', data: { trip: updatedTrip } });
  } catch (error) {
    await t.rollback();
    console.error('Complete trip error:', error);
    res.status(500).json({ success: false, message: 'Error completing trip' });
  }
});

// PUT /api/trips/:id/cancel - Cancel trip
router.put('/:id/cancel', authenticate, authorize('admin', 'dispatcher'), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const trip = await Trip.findByPk(req.params.id, { transaction: t });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (['completed', 'cancelled'].includes(trip.status)) return res.status(400).json({ success: false, message: 'Trip cannot be cancelled. Current status: ' + trip.status });

    await trip.update({
      status: 'cancelled',
      notes: (trip.notes || '') + `\nCancelled: ${req.body.reason || 'No reason provided'}`,
      updatedById: req.user.id
    }, { transaction: t });

    const vehicle = await Vehicle.findByPk(trip.vehicleId, { transaction: t });
    if (vehicle) await vehicle.update({ availability: 'available' }, { transaction: t });
    const driver = await Driver.findByPk(trip.driverId, { transaction: t });
    if (driver) await driver.update({ availability: 'available' }, { transaction: t });

    await t.commit();
    res.json({ success: true, message: 'Trip cancelled successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Cancel trip error:', error);
    res.status(500).json({ success: false, message: 'Error cancelling trip' });
  }
});

// GET /api/trips/stats/overview - Trip statistics
router.get('/stats/overview', authenticate, authorize('admin', 'dispatcher'), async (req, res) => {
  try {
    const totalTrips = await Trip.count();
    const inProgress = await Trip.count({ where: { status: 'in-progress' } });
    const completed = await Trip }
   });
