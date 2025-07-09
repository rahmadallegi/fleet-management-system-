import express from 'express';
import { Vehicle, Driver } from '../models/index.js';
import { authenticate, authorize, authorizeVehicleAccess } from '../middleware/auth.js';
import { vehicleValidations, commonValidations } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/vehicles
// @desc    Get all vehicles with pagination and filtering
// @access  Private (Admin, Dispatcher, Driver - limited to assigned vehicles)
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
        availability,
        type,
        make,
        search
      } = req.query;

      // Build filter object
      let filter = {};
      
      // Role-based filtering
      if (req.user.role === 'driver') {
        // Drivers can only see their assigned vehicles
        filter.assignedDriver = req.user._id;
      }
      
      if (status) filter.status = status;
      if (availability) filter.availability = availability;
      if (type) filter.type = type;
      if (make) filter.make = { $regex: make, $options: 'i' };
      
      if (search) {
        filter.$or = [
          { plateNumber: { $regex: search, $options: 'i' } },
          { make: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } },
          { vin: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sortOrder = sort === 'desc' ? -1 : 1;
      const sortObj = { [sortBy]: sortOrder };

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const [vehicles, total] = await Promise.all([
        Vehicle.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('assignedDriver', 'firstName lastName email phone')
          .populate('createdBy', 'firstName lastName email')
          .populate('updatedBy', 'firstName lastName email'),
        Vehicle.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          vehicles,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalVehicles: total,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get vehicles error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vehicles'
      });
    }
  }
);

// @route   GET /api/vehicles/available
// @desc    Get available vehicles for assignment
// @access  Private (Admin, Dispatcher)
router.get('/available',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const vehicles = await Vehicle.findAvailable()
        .populate('assignedDriver', 'firstName lastName email')
        .sort({ plateNumber: 1 });

      res.json({
        success: true,
        data: { vehicles }
      });

    } catch (error) {
      console.error('Get available vehicles error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching available vehicles'
      });
    }
  }
);

// @route   GET /api/vehicles/:id
// @desc    Get vehicle by ID
// @access  Private (Admin, Dispatcher, or assigned driver)
router.get('/:id',
  authenticate,
  authorizeVehicleAccess,
  async (req, res) => {
    try {
      const { id } = req.params;

      const vehicle = await Vehicle.findById(id)
        .populate('assignedDriver', 'firstName lastName email phone license')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      res.json({
        success: true,
        data: { vehicle }
      });

    } catch (error) {
      console.error('Get vehicle error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vehicle'
      });
    }
  }
);

// @route   POST /api/vehicles
// @desc    Create new vehicle
// @access  Private (Admin, Dispatcher)
router.post('/',
  authenticate,
  authorize('admin', 'dispatcher'),
  vehicleValidations.create,
  async (req, res) => {
    try {
      const vehicleData = {
        ...req.body,
        createdBy: req.user._id
      };

      // Check if plate number already exists
      const existingVehicle = await Vehicle.findOne({ 
        plateNumber: vehicleData.plateNumber.toUpperCase() 
      });
      
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle with this plate number already exists'
        });
      }

      // Check if VIN already exists (if provided)
      if (vehicleData.vin) {
        const existingVin = await Vehicle.findOne({ vin: vehicleData.vin.toUpperCase() });
        if (existingVin) {
          return res.status(400).json({
            success: false,
            message: 'Vehicle with this VIN already exists'
          });
        }
      }

      const vehicle = new Vehicle(vehicleData);
      await vehicle.save();

      const populatedVehicle = await Vehicle.findById(vehicle._id)
        .populate('assignedDriver', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email');

      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: { vehicle: populatedVehicle }
      });

    } catch (error) {
      console.error('Create vehicle error:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating vehicle'
      });
    }
  }
);

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle
// @access  Private (Admin, Dispatcher)
router.put('/:id',
  authenticate,
  authorize('admin', 'dispatcher'),
  vehicleValidations.update,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = {
        ...req.body,
        updatedBy: req.user._id
      };

      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      // Check for plate number uniqueness if being updated
      if (updates.plateNumber && updates.plateNumber.toUpperCase() !== vehicle.plateNumber) {
        const existingVehicle = await Vehicle.findOne({ 
          plateNumber: updates.plateNumber.toUpperCase() 
        });
        if (existingVehicle) {
          return res.status(400).json({
            success: false,
            message: 'Plate number already exists'
          });
        }
      }

      // Check for VIN uniqueness if being updated
      if (updates.vin && updates.vin.toUpperCase() !== vehicle.vin) {
        const existingVin = await Vehicle.findOne({ vin: updates.vin.toUpperCase() });
        if (existingVin) {
          return res.status(400).json({
            success: false,
            message: 'VIN already exists'
          });
        }
      }

      const updatedVehicle = await Vehicle.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      )
        .populate('assignedDriver', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

      res.json({
        success: true,
        message: 'Vehicle updated successfully',
        data: { vehicle: updatedVehicle }
      });

    } catch (error) {
      console.error('Update vehicle error:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating vehicle'
      });
    }
  }
);

// @route   DELETE /api/vehicles/:id
// @desc    Delete vehicle (soft delete by setting status to retired)
// @access  Private (Admin only)
router.delete('/:id',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      // Check if vehicle is currently assigned to active trips
      // TODO: Add trip check when trip model is implemented

      // Soft delete by setting status to retired
      vehicle.status = 'retired';
      vehicle.availability = 'out-of-service';
      vehicle.assignedDriver = null;
      vehicle.updatedBy = req.user._id;
      await vehicle.save();

      res.json({
        success: true,
        message: 'Vehicle retired successfully'
      });

    } catch (error) {
      console.error('Delete vehicle error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retiring vehicle'
      });
    }
  }
);

// @route   PUT /api/vehicles/:id/assign-driver
// @desc    Assign driver to vehicle
// @access  Private (Admin, Dispatcher)
router.put('/:id/assign-driver',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { driverId } = req.body;

      if (!driverId) {
        return res.status(400).json({
          success: false,
          message: 'Driver ID is required'
        });
      }

      // Check if vehicle exists
      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      // Check if driver exists and is available
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      if (driver.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Driver is not active'
        });
      }

      // Check if driver is already assigned to another vehicle
      const existingAssignment = await Vehicle.findOne({ 
        assignedDriver: driverId,
        _id: { $ne: id }
      });
      
      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: 'Driver is already assigned to another vehicle'
        });
      }

      // Assign driver to vehicle
      vehicle.assignedDriver = driverId;
      vehicle.updatedBy = req.user._id;
      await vehicle.save();

      const updatedVehicle = await Vehicle.findById(id)
        .populate('assignedDriver', 'firstName lastName email phone');

      res.json({
        success: true,
        message: 'Driver assigned successfully',
        data: { vehicle: updatedVehicle }
      });

    } catch (error) {
      console.error('Assign driver error:', error);
      res.status(500).json({
        success: false,
        message: 'Error assigning driver'
      });
    }
  }
);

// @route   PUT /api/vehicles/:id/unassign-driver
// @desc    Unassign driver from vehicle
// @access  Private (Admin, Dispatcher)
router.put('/:id/unassign-driver',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      if (!vehicle.assignedDriver) {
        return res.status(400).json({
          success: false,
          message: 'No driver is currently assigned to this vehicle'
        });
      }

      // Check if vehicle is currently on an active trip
      // TODO: Add trip check when trip model is implemented

      // Unassign driver
      vehicle.assignedDriver = null;
      vehicle.updatedBy = req.user._id;
      await vehicle.save();

      res.json({
        success: true,
        message: 'Driver unassigned successfully'
      });

    } catch (error) {
      console.error('Unassign driver error:', error);
      res.status(500).json({
        success: false,
        message: 'Error unassigning driver'
      });
    }
  }
);

// @route   PUT /api/vehicles/:id/status
// @desc    Update vehicle status
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

      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      // Update status and/or availability
      if (status) vehicle.status = status;
      if (availability) vehicle.availability = availability;
      vehicle.updatedBy = req.user._id;

      await vehicle.save();

      const updatedVehicle = await Vehicle.findById(id)
        .populate('assignedDriver', 'firstName lastName email');

      res.json({
        success: true,
        message: 'Vehicle status updated successfully',
        data: { vehicle: updatedVehicle }
      });

    } catch (error) {
      console.error('Update vehicle status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating vehicle status'
      });
    }
  }
);

// @route   GET /api/vehicles/stats/overview
// @desc    Get vehicle statistics overview
// @access  Private (Admin, Dispatcher)
router.get('/stats/overview',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const stats = await Vehicle.aggregate([
        {
          $group: {
            _id: null,
            totalVehicles: { $sum: 1 },
            activeVehicles: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            availableVehicles: { $sum: { $cond: [{ $eq: ['$availability', 'available'] }, 1, 0] } },
            inUseVehicles: { $sum: { $cond: [{ $eq: ['$availability', 'in-use'] }, 1, 0] } },
            maintenanceVehicles: { $sum: { $cond: [{ $eq: ['$availability', 'maintenance'] }, 1, 0] } },
            outOfServiceVehicles: { $sum: { $cond: [{ $eq: ['$availability', 'out-of-service'] }, 1, 0] } },
            assignedVehicles: { $sum: { $cond: [{ $ne: ['$assignedDriver', null] }, 1, 0] } }
          }
        }
      ]);

      const overview = stats[0] || {
        totalVehicles: 0,
        activeVehicles: 0,
        availableVehicles: 0,
        inUseVehicles: 0,
        maintenanceVehicles: 0,
        outOfServiceVehicles: 0,
        assignedVehicles: 0
      };

      res.json({
        success: true,
        data: { overview }
      });

    } catch (error) {
      console.error('Get vehicle stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vehicle statistics'
      });
    }
  }
);

export default router;
