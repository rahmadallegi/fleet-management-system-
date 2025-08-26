import express from 'express';
import { Driver, Vehicle } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { driverValidations, commonValidations } from '../middleware/validation.js';
import { Op } from 'sequelize';

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
      const where = {};

      if (status) where.status = status;
      if (availability) where.availability = availability;

      if (search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { employeeId: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Build order array
      const order = [[sortBy, sort.toUpperCase()]];

      // Calculate offset
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const { count, rows: drivers } = await Driver.findAndCountAll({
        where,
        order,
        offset,
        limit: parseInt(limit),
        include: [
          { model: Vehicle, as: 'assignedVehicles', attributes: ['plateNumber', 'make', 'model', 'type'] },
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
          drivers,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalDrivers: count,
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
      const drivers = await Driver.findAll({
        where: { status: 'active', availability: 'available' },
        include: [{ model: Vehicle, as: 'assignedVehicles', attributes: ['plateNumber', 'make', 'model'] }],
        order: [['firstName', 'ASC'], ['lastName', 'ASC']]
      });

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
      if (req.user.role === 'driver' && req.user.id.toString() !== id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own profile.'
        });
      }

      const driver = await Driver.findByPk(id, {
        include: [
          { model: Vehicle, as: 'assignedVehicles', attributes: ['plateNumber', 'make', 'model', 'type', 'status'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

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
        createdById: req.user.id
      };

      const driver = await Driver.create(driverData);

      const populatedDriver = await Driver.findByPk(driver.id, {
        include: [{ model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] }]
      });

      res.status(201).json({
        success: true,
        message: 'Driver created successfully',
        data: { driver: populatedDriver }
      });

    } catch (error) {
      console.error('Create driver error:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(error.fields)[0];
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
      const isOwnProfile = req.user.role === 'driver' && req.user.id.toString() === id;
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

      const driver = await Driver.findByPk(id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      updates.updatedById = req.user.id;
      await driver.update(updates);

      const updatedDriver = await Driver.findByPk(id, {
        include: [
          { model: Vehicle, as: 'assignedVehicles', attributes: ['plateNumber', 'make', 'model'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      res.json({
        success: true,
        message: 'Driver updated successfully',
        data: { driver: updatedDriver }
      });

    } catch (error) {
      console.error('Update driver error:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(error.fields)[0];
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

      const driver = await Driver.findByPk(id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      // Check if driver is currently assigned to vehicles
      const assignedVehicles = await Vehicle.findAll({ where: { assignedDriverId: id } });
      if (assignedVehicles.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete driver. Please unassign from vehicles first.',
          assignedVehicles: assignedVehicles.map(v => v.plateNumber)
        });
      }

      // Soft delete by setting status to terminated
      await driver.update({
        status: 'terminated',
        availability: 'unavailable',
        updatedById: req.user.id
      });

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

      const driver = await Driver.findByPk(id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      // Update status and/or availability
      const updates = {};
      if (status) updates.status = status;
      if (availability) updates.availability = availability;
      updates.updatedById = req.user.id;

      await driver.update(updates);

      const updatedDriver = await Driver.findByPk(id, {
        include: [{ model: Vehicle, as: 'assignedVehicles', attributes: ['plateNumber', 'make', 'model'] }]
      });

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

export default router;