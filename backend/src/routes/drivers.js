import express from 'express';
import { Driver, Vehicle } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { driverValidations, commonValidations } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/drivers
// @desc    Get all drivers with pagination and filtering
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
        sortBy = 'createdAt',
        status,
        availability,
        search
      } = req.query;

      // Build filter object
      const filter = {};
      
      if (status) filter.status = status;
      if (availability) filter.availability = availability;
      
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } },
          { 'license.number': { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sortOrder = sort === 'desc' ? -1 : 1;
      const sortObj = { [sortBy]: sortOrder };

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const [drivers, total] = await Promise.all([
        Driver.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('assignedVehicles.vehicle', 'plateNumber make model type')
          .populate('createdBy', 'firstName lastName email')
          .populate('updatedBy', 'firstName lastName email'),
        Driver.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          drivers,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalDrivers: total,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get drivers error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching drivers'
      });
    }
  }
);

// @route   GET /api/drivers/available
// @desc    Get available drivers for assignment
// @access  Private (Admin, Dispatcher)
router.get('/available',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const drivers = await Driver.findAvailable()
        .populate('assignedVehicles.vehicle', 'plateNumber make model')
        .sort({ firstName: 1, lastName: 1 });

      res.json({
        success: true,
        data: { drivers }
      });

    } catch (error) {
      console.error('Get available drivers error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching available drivers'
      });
    }
  }
);

// @route   GET /api/drivers/:id
// @desc    Get driver by ID
// @access  Private (Admin, Dispatcher, or own profile if driver)
router.get('/:id',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check permissions
      if (req.user.role === 'driver' && req.user._id.toString() !== id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own profile.'
        });
      }

      const driver = await Driver.findById(id)
        .populate('assignedVehicles.vehicle', 'plateNumber make model type status')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      res.json({
        success: true,
        data: { driver }
      });

    } catch (error) {
      console.error('Get driver error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching driver'
      });
    }
  }
);

// @route   POST /api/drivers
// @desc    Create new driver
// @access  Private (Admin, Dispatcher)
router.post('/',
  authenticate,
  authorize('admin', 'dispatcher'),
  driverValidations.create,
  async (req, res) => {
    try {
      const driverData = {
        ...req.body,
        createdBy: req.user._id
      };

      // Check if email already exists
      const existingEmail = await Driver.findOne({ email: driverData.email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Driver with this email already exists'
        });
      }

      // Check if employee ID already exists
      const existingEmployeeId = await Driver.findOne({ employeeId: driverData.employeeId });
      if (existingEmployeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }

      // Check if license number already exists
      const existingLicense = await Driver.findOne({ 'license.number': driverData.license.number });
      if (existingLicense) {
        return res.status(400).json({
          success: false,
          message: 'License number already exists'
        });
      }

      const driver = new Driver(driverData);
      await driver.save();

      const populatedDriver = await Driver.findById(driver._id)
        .populate('createdBy', 'firstName lastName email');

      res.status(201).json({
        success: true,
        message: 'Driver created successfully',
        data: { driver: populatedDriver }
      });

    } catch (error) {
      console.error('Create driver error:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating driver'
      });
    }
  }
);

// @route   PUT /api/drivers/:id
// @desc    Update driver
// @access  Private (Admin, Dispatcher, or own profile with limited fields)
router.put('/:id',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Check permissions
      const isOwnProfile = req.user.role === 'driver' && req.user._id.toString() === id;
      const isAuthorized = ['admin', 'dispatcher'].includes(req.user.role) || isOwnProfile;

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Access denied.'
        });
      }

      // Restrict fields for drivers updating their own profile
      if (isOwnProfile && req.user.role === 'driver') {
        const allowedFields = ['phone', 'address', 'emergencyContact'];
        const updateFields = Object.keys(updates);
        const restrictedFields = updateFields.filter(field => !allowedFields.includes(field));
        
        if (restrictedFields.length > 0) {
          return res.status(403).json({
            success: false,
            message: `You cannot update: ${restrictedFields.join(', ')}`
          });
        }
      }

      const driver = await Driver.findById(id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      // Check for email uniqueness if email is being updated
      if (updates.email && updates.email !== driver.email) {
        const existingEmail = await Driver.findOne({ email: updates.email.toLowerCase() });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      // Check for employee ID uniqueness if being updated
      if (updates.employeeId && updates.employeeId !== driver.employeeId) {
        const existingEmployeeId = await Driver.findOne({ employeeId: updates.employeeId });
        if (existingEmployeeId) {
          return res.status(400).json({
            success: false,
            message: 'Employee ID already exists'
          });
        }
      }

      // Check for license number uniqueness if being updated
      if (updates.license?.number && updates.license.number !== driver.license.number) {
        const existingLicense = await Driver.findOne({ 'license.number': updates.license.number });
        if (existingLicense) {
          return res.status(400).json({
            success: false,
            message: 'License number already exists'
          });
        }
      }

      updates.updatedBy = req.user._id;
      const updatedDriver = await Driver.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      )
        .populate('assignedVehicles.vehicle', 'plateNumber make model')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

      res.json({
        success: true,
        message: 'Driver updated successfully',
        data: { driver: updatedDriver }
      });

    } catch (error) {
      console.error('Update driver error:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating driver'
      });
    }
  }
);

// @route   DELETE /api/drivers/:id
// @desc    Delete driver (soft delete by setting status to terminated)
// @access  Private (Admin only)
router.delete('/:id',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const driver = await Driver.findById(id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      // Check if driver is currently assigned to vehicles
      const assignedVehicles = await Vehicle.find({ assignedDriver: id });
      if (assignedVehicles.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete driver. Please unassign from vehicles first.',
          assignedVehicles: assignedVehicles.map(v => v.plateNumber)
        });
      }

      // Soft delete by setting status to terminated
      driver.status = 'terminated';
      driver.availability = 'unavailable';
      driver.updatedBy = req.user._id;
      await driver.save();

      res.json({
        success: true,
        message: 'Driver terminated successfully'
      });

    } catch (error) {
      console.error('Delete driver error:', error);
      res.status(500).json({
        success: false,
        message: 'Error terminating driver'
      });
    }
  }
);

// @route   PUT /api/drivers/:id/status
// @desc    Update driver status and availability
// @access  Private (Admin, Dispatcher)
router.put('/:id/status',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, availability } = req.body;

      if (!status && !availability) {
        return res.status(400).json({
          success: false,
          message: 'Status or availability is required'
        });
      }

      const driver = await Driver.findById(id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      // Update status and/or availability
      if (status) driver.status = status;
      if (availability) driver.availability = availability;
      driver.updatedBy = req.user._id;

      await driver.save();

      const updatedDriver = await Driver.findById(id)
        .populate('assignedVehicles.vehicle', 'plateNumber make model');

      res.json({
        success: true,
        message: 'Driver status updated successfully',
        data: { driver: updatedDriver }
      });

    } catch (error) {
      console.error('Update driver status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating driver status'
      });
    }
  }
);

// @route   GET /api/drivers/:id/performance
// @desc    Get driver performance metrics
// @access  Private (Admin, Dispatcher, or own performance)
router.get('/:id/performance',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check permissions
      if (req.user.role === 'driver' && req.user._id.toString() !== id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own performance.'
        });
      }

      const driver = await Driver.findById(id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      // Get performance data
      const performance = {
        basic: {
          totalTrips: driver.performance.totalTrips,
          totalMiles: driver.performance.totalMiles,
          totalHours: driver.performance.totalHours,
          rating: driver.performance.rating,
          safetyScore: driver.performance.safetyScore
        },
        violations: driver.violations.length,
        recentViolations: driver.violations.slice(-5),
        training: driver.training.length,
        recentTraining: driver.training.slice(-3),
        licenseStatus: driver.licenseStatus,
        yearsOfService: driver.yearsOfService
      };

      res.json({
        success: true,
        data: { performance }
      });

    } catch (error) {
      console.error('Get driver performance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching driver performance'
      });
    }
  }
);

// @route   GET /api/drivers/stats/overview
// @desc    Get driver statistics overview
// @access  Private (Admin, Dispatcher)
router.get('/stats/overview',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const stats = await Driver.aggregate([
        {
          $group: {
            _id: null,
            totalDrivers: { $sum: 1 },
            activeDrivers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            availableDrivers: { $sum: { $cond: [{ $eq: ['$availability', 'available'] }, 1, 0] } },
            onDutyDrivers: { $sum: { $cond: [{ $eq: ['$availability', 'on-duty'] }, 1, 0] } },
            avgRating: { $avg: '$performance.rating' },
            avgSafetyScore: { $avg: '$performance.safetyScore' },
            totalViolations: { $sum: { $size: '$violations' } }
          }
        }
      ]);

      const overview = stats[0] || {
        totalDrivers: 0,
        activeDrivers: 0,
        availableDrivers: 0,
        onDutyDrivers: 0,
        avgRating: 0,
        avgSafetyScore: 0,
        totalViolations: 0
      };

      res.json({
        success: true,
        data: { overview }
      });

    } catch (error) {
      console.error('Get driver stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching driver statistics'
      });
    }
  }
);

export default router;
