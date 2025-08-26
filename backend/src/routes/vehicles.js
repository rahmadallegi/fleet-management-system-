import express from 'express';
import { Vehicle, Driver } from '../models/index.js';
import { authenticate, authorize, authorizeVehicleAccess } from '../middleware/auth.js';
import { vehicleValidations, commonValidations } from '../middleware/validation.js';
import { Op } from 'sequelize';

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
      let where = {};

      // Role-based filtering
      if (req.user.role === 'driver') {
        // Drivers can only see their assigned vehicles
        where.assignedDriverId = req.user.id;
      }

      if (status) where.status = status;
      if (availability) where.availability = availability;
      if (type) where.type = type;
      if (make) where.make = { [Op.iLike]: `%${make}%` };

      if (search) {
        where[Op.or] = [
          { plateNumber: { [Op.iLike]: `%${search}%` } },
          { make: { [Op.iLike]: `%${search}%` } },
          { model: { [Op.iLike]: `%${search}%` } },
          { vin: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Build order array
      const order = [[sortBy, sort.toUpperCase()]];

      // Calculate offset
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const { count, rows: vehicles } = await Vehicle.findAndCountAll({
        where,
        order,
        offset,
        limit: parseInt(limit),
        include: [
          { model: Driver, as: 'assignedDriver', attributes: ['firstName', 'lastName', 'email', 'phone'] },
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
          vehicles,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalVehicles: count,
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
      const vehicles = await Vehicle.findAll({
        where: { status: 'active', availability: 'available' },
        include: [{ model: Driver, as: 'assignedDriver', attributes: ['firstName', 'lastName', 'email'] }],
        order: [['plateNumber', 'ASC']]
      });

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

      const vehicle = await Vehicle.findByPk(id, {
        include: [
          { model: Driver, as: 'assignedDriver', attributes: ['firstName', 'lastName', 'email', 'phone', 'license'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

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
        createdById: req.user.id
      };

      const vehicle = await Vehicle.create(vehicleData);

      const populatedVehicle = await Vehicle.findByPk(vehicle.id, {
        include: [
          { model: Driver, as: 'assignedDriver', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: { vehicle: populatedVehicle }
      });

    } catch (error) {
      console.error('Create vehicle error:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(error.fields)[0];
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
        updatedById: req.user.id
      };

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      await vehicle.update(updates);

      const updatedVehicle = await Vehicle.findByPk(id, {
        include: [
          { model: Driver, as: 'assignedDriver', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      res.json({
        success: true,
        message: 'Vehicle updated successfully',
        data: { vehicle: updatedVehicle }
      });

    } catch (error) {
      console.error('Update vehicle error:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(error.fields)[0];
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

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      // Soft delete by setting status to retired
      await vehicle.update({
        status: 'retired',
        availability: 'out-of-service',
        assignedDriverId: null,
        updatedById: req.user.id
      });

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
      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      // Check if driver exists and is available
      const driver = await Driver.findByPk(driverId);
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
      const existingAssignment = await Vehicle.findOne({ where: { assignedDriverId: driverId, id: { [Op.ne]: id } } });

      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: 'Driver is already assigned to another vehicle'
        });
      }

      // Assign driver to vehicle
      await vehicle.update({ assignedDriverId: driverId, updatedById: req.user.id });

      const updatedVehicle = await Vehicle.findByPk(id, {
        include: [{ model: Driver, as: 'assignedDriver', attributes: ['firstName', 'lastName', 'email', 'phone'] }]
      });

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

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      if (!vehicle.assignedDriverId) {
        return res.status(400).json({
          success: false,
          message: 'No driver is currently assigned to this vehicle'
        });
      }

      // Unassign driver
      await vehicle.update({ assignedDriverId: null, updatedById: req.user.id });

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

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      // Update status and/or availability
      const updates = {};
      if (status) updates.status = status;
      if (availability) updates.availability = availability;
      updates.updatedById = req.user.id;

      await vehicle.update(updates);

      const updatedVehicle = await Vehicle.findByPk(id, {
        include: [{ model: Driver, as: 'assignedDriver', attributes: ['firstName', 'lastName', 'email'] }]
      });

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
      const stats = await Vehicle.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalVehicles'],
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = \'active\' THEN 1 ELSE 0 END')), 'activeVehicles'],
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN availability = \'available\' THEN 1 ELSE 0 END')), 'availableVehicles'],
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN availability = \'in-use\' THEN 1 ELSE 0 END')), 'inUseVehicles'],
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN availability = \'maintenance\' THEN 1 ELSE 0 END')), 'maintenanceVehicles'],
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN availability = \'out-of-service\' THEN 1 ELSE 0 END')), 'outOfServiceVehicles'],
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN \"assignedDriverId\" IS NOT NULL THEN 1 ELSE 0 END')), 'assignedVehicles'],
        ],
        raw: true,
      });

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