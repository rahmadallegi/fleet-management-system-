import express from 'express';
import { Trip, Vehicle, Driver } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { tripValidations, commonValidations } from '../middleware/validation.js';
import { dbUtils } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// @route   GET /api/trips
// @desc    Get all trips with pagination and filtering
// @access  Private (Admin, Dispatcher, Driver - limited to assigned trips)
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
        vehicleId,
        driverId,
        startDate,
        endDate
      } = req.query;

      // Build filter object
      let where = {};

      // Role-based filtering
      if (req.user.role === 'driver') {
        // Drivers can only see their assigned trips
        where.driverId = req.user.id;
      }

      if (status) where.status = status;
      if (vehicleId) where.vehicleId = vehicleId;
      if (driverId && req.user.role !== 'driver') where.driverId = driverId;

      if (startDate || endDate) {
        where.schedule = { ...where.schedule }; // Ensure schedule object exists
        where.schedule.plannedStart = {};
        if (startDate) where.schedule.plannedStart[Op.gte] = new Date(startDate);
        if (endDate) where.schedule.plannedStart[Op.lte] = new Date(endDate);
      }

      // Build order array
      const order = [[sortBy, sort.toUpperCase()]];

      // Calculate offset
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
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

      // Calculate pagination info
      const totalPages = Math.ceil(count / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          trips,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalTrips: count,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get trips error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching trips'
      });
    }
  }
);

// @route   GET /api/trips/active
// @desc    Get active/in-progress trips
// @access  Private (Admin, Dispatcher, Driver)
router.get('/active',
  authenticate,
  async (req, res) => {
    try {
      let where = { status: 'in-progress' };

      // Role-based filtering
      if (req.user.role === 'driver') {
        where.driverId = req.user.id;
      }

      const trips = await Trip.findAll({
        where,
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type', 'gpsDevice'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'phone'] },
        ],
        order: [['schedule', 'plannedStart', 'ASC']]
      });

      res.json({
        success: true,
        data: { trips }
      });

    } catch (error) {
      console.error('Get active trips error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching active trips'
      });
    }
  }
);

// @route   GET /api/trips/:id
// @desc    Get trip by ID
// @access  Private (Admin, Dispatcher, or assigned driver)
router.get('/:id',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;

      const trip = await Trip.findByPk(id, {
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type', 'status', 'gpsDevice'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'email', 'phone', 'license'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      // Check permissions
      if (req.user.role === 'driver' && trip.driverId.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your assigned trips.'
        });
      }

      res.json({
        success: true,
        data: { trip }
      });

    } catch (error) {
      console.error('Get trip error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching trip'
      });
    }
  }
);

// @route   POST /api/trips
// @desc    Create new trip
// @access  Private (Admin, Dispatcher)
router.post('/',
  authenticate,
  authorize('admin', 'dispatcher'),
  tripValidations.create,
  async (req, res) => {
    try {
      const tripData = {
        ...req.body,
        tripNumber: dbUtils.generateTripNumber(),
        createdById: req.user.id
      };

      // Validate vehicle exists and is available
      const vehicle = await Vehicle.findByPk(tripData.vehicleId);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      if (vehicle.status !== 'active' || vehicle.availability !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'Vehicle is not available for assignment'
        });
      }

      // Validate driver exists and is available
      const driver = await Driver.findByPk(tripData.driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      if (driver.status !== 'active' || driver.availability !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'Driver is not available for assignment'
        });
      }

      const trip = await Trip.create(tripData);

      // Update vehicle and driver availability
      await Promise.all([
        vehicle.update({ availability: 'in-use' }),
        driver.update({ availability: 'on-duty' })
      ]);

      const populatedTrip = await Trip.findByPk(trip.id, {
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'email', 'phone'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Trip created successfully',
        data: { trip: populatedTrip }
      });

    } catch (error) {
      console.error('Create trip error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating trip'
      });
    }
  }
);

// @route   PUT /api/trips/:id
// @desc    Update trip
// @access  Private (Admin, Dispatcher, or assigned driver with limited fields)
router.put('/:id',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const trip = await Trip.findByPk(id);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      // Check permissions
      const isAssignedDriver = req.user.role === 'driver' && trip.driverId.toString() === req.user.id.toString();
      const isAuthorized = ['admin', 'dispatcher'].includes(req.user.role) || isAssignedDriver;

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Access denied.'
        });
      }

      // Restrict fields for drivers
      if (isAssignedDriver) {
        const allowedFields = ['status', 'odometer', 'fuel', 'incidents', 'notes', 'completion'];
        const updateFields = Object.keys(updates);
        const restrictedFields = updateFields.filter(field => !allowedFields.includes(field));

        if (restrictedFields.length > 0) {
          return res.status(403).json({
            success: false,
            message: `You cannot update: ${restrictedFields.join(', ')}`
          });
        }
      }

      updates.updatedById = req.user.id;
      await trip.update(updates);

      const updatedTrip = await Trip.findByPk(id, {
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model', 'type'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName', 'email', 'phone'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      res.json({
        success: true,
        message: 'Trip updated successfully',
        data: { trip: updatedTrip }
      });

    } catch (error) {
      console.error('Update trip error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating trip'
      });
    }
  }
);

// @route   PUT /api/trips/:id/start
// @desc    Start a trip
// @access  Private (Admin, Dispatcher, or assigned driver)
router.put('/:id/start',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { odometerStart, fuelStart } = req.body;

      const trip = await Trip.findByPk(id);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      // Check permissions
      const isAssignedDriver = req.user.role === 'driver' && trip.driverId.toString() === req.user.id.toString();
      const isAuthorized = ['admin', 'dispatcher'].includes(req.user.role) || isAssignedDriver;

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Access denied.'
        });
      }

      if (trip.status !== 'assigned' && trip.status !== 'planned') {
        return res.status(400).json({
          success: false,
          message: 'Trip cannot be started. Current status: ' + trip.status
        });
      }

      // Update trip status and start details
      await trip.update({
        status: 'in-progress',
        schedule: { ...trip.schedule, actualStart: new Date() },
        odometer: { ...trip.odometer, start: odometerStart },
        fuel: { ...trip.fuel, startLevel: fuelStart },
        updatedById: req.user.id
      });

      const updatedTrip = await Trip.findByPk(id, {
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName'] },
        ]
      });

      res.json({
        success: true,
        message: 'Trip started successfully',
        data: { trip: updatedTrip }
      });

    } catch (error) {
      console.error('Start trip error:', error);
      res.status(500).json({
        success: false,
        message: 'Error starting trip'
      });
    }
  }
);

// @route   PUT /api/trips/:id/complete
// @desc    Complete a trip
// @access  Private (Admin, Dispatcher, or assigned driver)
router.put('/:id/complete',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { odometerEnd, fuelEnd, completion } = req.body;

      const trip = await Trip.findByPk(id);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      // Check permissions
      const isAssignedDriver = req.user.role === 'driver' && trip.driverId.toString() === req.user.id.toString();
      const isAuthorized = ['admin', 'dispatcher'].includes(req.user.role) || isAssignedDriver;

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Access denied.'
        });
      }

      if (trip.status !== 'in-progress') {
        return res.status(400).json({
          success: false,
          message: 'Trip cannot be completed. Current status: ' + trip.status
        });
      }

      // Update trip completion details
      await trip.update({
        status: 'completed',
        schedule: { ...trip.schedule, actualEnd: new Date() },
        odometer: { ...trip.odometer, end: odometerEnd },
        fuel: { ...trip.fuel, endLevel: fuelEnd },
        completion: { ...trip.completion, ...completion },
        updatedById: req.user.id
      });

      // Update vehicle and driver availability
      const vehicle = await Vehicle.findByPk(trip.vehicleId);
      if (vehicle) await vehicle.update({ availability: 'available' });

      const driver = await Driver.findByPk(trip.driverId);
      if (driver) await driver.update({ availability: 'available' });

      const updatedTrip = await Trip.findByPk(id, {
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'make', 'model'] },
          { model: Driver, as: 'driver', attributes: ['firstName', 'lastName'] },
        ]
      });

      res.json({
        success: true,
        message: 'Trip completed successfully',
        data: { trip: updatedTrip }
      });

    } catch (error) {
      console.error('Complete trip error:', error);
      res.status(500).json({
        success: false,
        message: 'Error completing trip'
      });
    }
  }
);

// @route   PUT /api/trips/:id/cancel
// @desc    Cancel a trip
// @access  Private (Admin, Dispatcher)
router.put('/:id/cancel',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const trip = await Trip.findByPk(id);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      if (trip.status === 'completed' || trip.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Trip cannot be cancelled. Current status: ' + trip.status
        });
      }

      // Update trip status
      await trip.update({
        status: 'cancelled',
        notes: (trip.notes || '') + `\nCancelled: ${reason || 'No reason provided'}`, // Corrected escaping for newline
        updatedById: req.user.id
      });

      // Update vehicle and driver availability
      const vehicle = await Vehicle.findByPk(trip.vehicleId);
      if (vehicle) await vehicle.update({ availability: 'available' });

      const driver = await Driver.findByPk(trip.driverId);
      if (driver) await driver.update({ availability: 'available' });

      res.json({
        success: true,
        message: 'Trip cancelled successfully'
      });

    } catch (error) {
      console.error('Cancel trip error:', error);
      res.status(500).json({
        success: false,
        message: 'Error cancelling trip'
      });
    }
  }
);

export default router;