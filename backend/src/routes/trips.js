import express from 'express';
import { Trip, Vehicle, Driver } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { tripValidations, commonValidations } from '../middleware/validation.js';
import { dbUtils } from '../models/index.js';

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
        vehicle,
        driver,
        startDate,
        endDate
      } = req.query;

      // Build filter object
      let filter = {};
      
      // Role-based filtering
      if (req.user.role === 'driver') {
        // Drivers can only see their assigned trips
        filter.driver = req.user._id;
      }
      
      if (status) filter.status = status;
      if (vehicle) filter.vehicle = vehicle;
      if (driver && req.user.role !== 'driver') filter.driver = driver;
      
      if (startDate || endDate) {
        filter['schedule.plannedStart'] = {};
        if (startDate) filter['schedule.plannedStart'].$gte = new Date(startDate);
        if (endDate) filter['schedule.plannedStart'].$lte = new Date(endDate);
      }

      // Build sort object
      const sortOrder = sort === 'desc' ? -1 : 1;
      const sortObj = { [sortBy]: sortOrder };

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const [trips, total] = await Promise.all([
        Trip.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('vehicle', 'plateNumber make model type')
          .populate('driver', 'firstName lastName email phone')
          .populate('createdBy', 'firstName lastName email')
          .populate('updatedBy', 'firstName lastName email'),
        Trip.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          trips,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalTrips: total,
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
      let filter = { status: 'in-progress' };
      
      // Role-based filtering
      if (req.user.role === 'driver') {
        filter.driver = req.user._id;
      }

      const trips = await Trip.find(filter)
        .populate('vehicle', 'plateNumber make model type gpsDevice')
        .populate('driver', 'firstName lastName phone')
        .sort({ 'schedule.plannedStart': 1 });

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

      const trip = await Trip.findById(id)
        .populate('vehicle', 'plateNumber make model type status gpsDevice')
        .populate('driver', 'firstName lastName email phone license')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      // Check permissions
      if (req.user.role === 'driver' && trip.driver._id.toString() !== req.user._id.toString()) {
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
        createdBy: req.user._id
      };

      // Validate vehicle exists and is available
      const vehicle = await Vehicle.findById(tripData.vehicle);
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
      const driver = await Driver.findById(tripData.driver);
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

      // Check for conflicting trips
      const conflictingTrips = await Trip.find({
        $or: [
          { vehicle: tripData.vehicle },
          { driver: tripData.driver }
        ],
        status: { $in: ['planned', 'assigned', 'in-progress'] },
        $or: [
          {
            'schedule.plannedStart': {
              $lte: new Date(tripData.schedule.plannedEnd)
            },
            'schedule.plannedEnd': {
              $gte: new Date(tripData.schedule.plannedStart)
            }
          }
        ]
      });

      if (conflictingTrips.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle or driver has conflicting trip assignments',
          conflicts: conflictingTrips.map(t => ({
            tripNumber: t.tripNumber,
            start: t.schedule.plannedStart,
            end: t.schedule.plannedEnd
          }))
        });
      }

      const trip = new Trip(tripData);
      await trip.save();

      // Update vehicle and driver availability
      await Promise.all([
        Vehicle.findByIdAndUpdate(tripData.vehicle, { availability: 'in-use' }),
        Driver.findByIdAndUpdate(tripData.driver, { availability: 'on-duty' })
      ]);

      const populatedTrip = await Trip.findById(trip._id)
        .populate('vehicle', 'plateNumber make model type')
        .populate('driver', 'firstName lastName email phone')
        .populate('createdBy', 'firstName lastName email');

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

      const trip = await Trip.findById(id);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      // Check permissions
      const isAssignedDriver = req.user.role === 'driver' && trip.driver.toString() === req.user._id.toString();
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

      updates.updatedBy = req.user._id;
      const updatedTrip = await Trip.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      )
        .populate('vehicle', 'plateNumber make model type')
        .populate('driver', 'firstName lastName email phone')
        .populate('updatedBy', 'firstName lastName email');

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

      const trip = await Trip.findById(id);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      // Check permissions
      const isAssignedDriver = req.user.role === 'driver' && trip.driver.toString() === req.user._id.toString();
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
      trip.status = 'in-progress';
      trip.schedule.actualStart = new Date();
      if (odometerStart) trip.odometer.start = odometerStart;
      if (fuelStart) trip.fuel.startLevel = fuelStart;
      trip.updatedBy = req.user._id;

      await trip.save();

      const updatedTrip = await Trip.findById(id)
        .populate('vehicle', 'plateNumber make model')
        .populate('driver', 'firstName lastName');

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

      const trip = await Trip.findById(id);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      // Check permissions
      const isAssignedDriver = req.user.role === 'driver' && trip.driver.toString() === req.user._id.toString();
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
      trip.status = 'completed';
      trip.schedule.actualEnd = new Date();
      if (odometerEnd) trip.odometer.end = odometerEnd;
      if (fuelEnd) trip.fuel.endLevel = fuelEnd;
      if (completion) trip.completion = { ...trip.completion, ...completion };
      trip.updatedBy = req.user._id;

      await trip.save();

      // Update vehicle and driver availability
      await Promise.all([
        Vehicle.findByIdAndUpdate(trip.vehicle, { availability: 'available' }),
        Driver.findByIdAndUpdate(trip.driver, { availability: 'available' })
      ]);

      const updatedTrip = await Trip.findById(id)
        .populate('vehicle', 'plateNumber make model')
        .populate('driver', 'firstName lastName');

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

      const trip = await Trip.findById(id);
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
      trip.status = 'cancelled';
      trip.notes = (trip.notes || '') + `\nCancelled: ${reason || 'No reason provided'}`;
      trip.updatedBy = req.user._id;

      await trip.save();

      // Update vehicle and driver availability
      await Promise.all([
        Vehicle.findByIdAndUpdate(trip.vehicle, { availability: 'available' }),
        Driver.findByIdAndUpdate(trip.driver, { availability: 'available' })
      ]);

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

// @route   GET /api/trips/stats/overview
// @desc    Get trip statistics overview
// @access  Private (Admin, Dispatcher)
router.get('/stats/overview',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let matchStage = {};
      if (startDate || endDate) {
        matchStage['schedule.plannedStart'] = {};
        if (startDate) matchStage['schedule.plannedStart'].$gte = new Date(startDate);
        if (endDate) matchStage['schedule.plannedStart'].$lte = new Date(endDate);
      }

      const stats = await Trip.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalTrips: { $sum: 1 },
            completedTrips: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            activeTrips: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
            plannedTrips: { $sum: { $cond: [{ $eq: ['$status', 'planned'] }, 1, 0] } },
            cancelledTrips: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
            totalDistance: { $sum: '$route.actualDistance.value' },
            totalCosts: { $sum: '$costs.total' },
            avgRating: { $avg: '$completion.rating' }
          }
        }
      ]);

      const overview = stats[0] || {
        totalTrips: 0,
        completedTrips: 0,
        activeTrips: 0,
        plannedTrips: 0,
        cancelledTrips: 0,
        totalDistance: 0,
        totalCosts: 0,
        avgRating: 0
      };

      res.json({
        success: true,
        data: { overview }
      });

    } catch (error) {
      console.error('Get trip stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching trip statistics'
      });
    }
  }
);

export default router;
