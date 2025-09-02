import express from 'express';
import models from '../models/index.js';
const { Vehicle, Driver, User } = models;
import { authenticate, authorize, authorizeVehicleAccess } from '../middleware/auth.js';
import { vehicleValidations, commonValidations } from '../middleware/validation.js';
import { Op, fn, col, literal } from 'sequelize';

const router = express.Router();

// ------------------------- GET /api/vehicles -------------------------
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

      const maxLimit = 100;
      const queryLimit = Math.min(parseInt(limit), maxLimit);
      const offset = (parseInt(page) - 1) * queryLimit;

      // Role-based filtering
      let where = {};
      if (req.user.role === 'driver') {
        where.assignedDriverId = req.user.id;
      }
      if (status) where.status = status.toString();
      if (availability) where.availability = availability.toString();
      if (type) where.type = type.toString();
      if (make) where.make = { [Op.iLike]: `%${make}%` };
      if (search) {
        where[Op.or] = [
          { plateNumber: { [Op.iLike]: `%${search}%` } },
          { make: { [Op.iLike]: `%${search}%` } },
          { model: { [Op.iLike]: `%${search}%` } },
          { vin: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const order = [[sortBy, sort.toUpperCase()]];

      const { count, rows: vehicles } = await Vehicle.findAndCountAll({
        where,
        order,
        offset,
        limit: queryLimit,
        include: [
          { model: Driver, as: 'assignedDriver', attributes: ['firstName', 'lastName', 'email', 'phone', 'license'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      const totalPages = Math.ceil(count / queryLimit);

      res.json({
        success: true,
        data: {
          vehicles,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalVehicles: count,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1,
            limit: queryLimit
          }
        }
      });
    } catch (error) {
      console.error('Get vehicles error:', error);
      res.status(500).json({ success: false, message: 'Error fetching vehicles' });
    }
  }
);

// ------------------------- GET /api/vehicles/available -------------------------
router.get('/available',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const vehicles = await Vehicle.findAll({
        where: { status: 'active', availability: 'available' },
        include: [
          { model: Driver, as: 'assignedDriver', attributes: ['firstName', 'lastName', 'email'] }
        ],
        order: [['plateNumber', 'ASC']]
      });

      res.json({ success: true, data: { vehicles } });
    } catch (error) {
      console.error('Get available vehicles error:', error);
      res.status(500).json({ success: false, message: 'Error fetching available vehicles' });
    }
  }
);

// ------------------------- GET /api/vehicles/:id -------------------------
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

      if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

      res.json({ success: true, data: { vehicle } });
    } catch (error) {
      console.error('Get vehicle error:', error);
      res.status(500).json({ success: false, message: 'Error fetching vehicle' });
    }
  }
);

// ------------------------- POST /api/vehicles -------------------------
router.post('/',
  authenticate,
  authorize('admin', 'dispatcher'),
  vehicleValidations.create,
  async (req, res) => {
    try {
      const vehicleData = { ...req.body, createdById: req.user.id };
      const vehicle = await Vehicle.create(vehicleData);

      const populatedVehicle = await Vehicle.findByPk(vehicle.id, {
        include: [
          { model: Driver, as: 'assignedDriver', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] }
        ]
      });

      res.status(201).json({ success: true, message: 'Vehicle created successfully', data: { vehicle: populatedVehicle } });
    } catch (error) {
      console.error('Create vehicle error:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(error.fields)[0];
        return res.status(400).json({ success: false, message: `${field} already exists` });
      }
      res.status(500).json({ success: false, message: 'Error creating vehicle' });
    }
  }
);

// ------------------------- PUT /api/vehicles/:id -------------------------
router.put('/:id',
  authenticate,
  authorize('admin', 'dispatcher'),
  vehicleValidations.update,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body, updatedById: req.user.id };

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

      await vehicle.update(updates);

      const updatedVehicle = await Vehicle.findByPk(id, {
        include: [
          { model: Driver, as: 'assignedDriver', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      res.json({ success: true, message: 'Vehicle updated successfully', data: { vehicle: updatedVehicle } });
    } catch (error) {
      console.error('Update vehicle error:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(error.fields)[0];
        return res.status(400).json({ success: false, message: `${field} already exists` });
      }
      res.status(500).json({ success: false, message: 'Error updating vehicle' });
    }
  }
);

// ------------------------- DELETE /api/vehicles/:id -------------------------
router.delete('/:id',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

      await vehicle.update({
        status: 'retired',
        availability: 'out-of-service',
        assignedDriverId: null,
        updatedById: req.user.id
      });

      res.json({ success: true, message: 'Vehicle retired successfully' });
    } catch (error) {
      console.error('Delete vehicle error:', error);
      res.status(500).json({ success: false, message: 'Error retiring vehicle' });
    }
  }
);

// ------------------------- PUT /api/vehicles/:id/assign-driver -------------------------
router.put('/:id/assign-driver',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { driverId } = req.body;
      if (!driverId) return res.status(400).json({ success: false, message: 'Driver ID is required' });

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

      const driver = await Driver.findByPk(driverId);
      if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
      if (driver.status !== 'active') return res.status(400).json({ success: false, message: 'Driver is not active' });

      const existingAssignment = await Vehicle.findOne({ where: { assignedDriverId: driverId, id: { [Op.ne]: id } } });
      if (existingAssignment) return res.status(400).json({ success: false, message: 'Driver is already assigned to another vehicle' });

      await vehicle.update({ assignedDriverId: driverId, updatedById: req.user.id });

      const updatedVehicle = await Vehicle.findByPk(id, {
        include: [{ model: Driver, as: 'assignedDriver', attributes: ['firstName', 'lastName', 'email', 'phone'] }]
      });

      res.json({ success: true, message: 'Driver assigned successfully', data: { vehicle: updatedVehicle } });
    } catch (error) {
      console.error('Assign driver error:', error);
      res.status(500).json({ success: false, message: 'Error assigning driver' });
    }
  }
);

// ------------------------- PUT /api/vehicles/:id/unassign-driver -------------------------
router.put('/:id/unassign-driver',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
      if (!vehicle.assignedDriverId) return res.status(400).json({ success: false, message: 'No driver assigned' });

      await vehicle.update({ assignedDriverId: null, updatedById: req.user.id });

      res.json({ success: true, message: 'Driver unassigned successfully' });
    } catch (error) {
      console.error('Unassign driver error:', error);
      res.status(500).json({ success: false, message: 'Error unassigning driver' });
    }
  }
);

// ------------------------- PUT /api/vehicles/:id/status -------------------------
router.put('/:id/status',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, availability } = req.body;
      if (!status && !availability) return res.status(400).json({ success: false, message: 'Status or availability is required' });

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

      const updates = { updatedById: req.user.id };
      if (status) updates.status = status;
      if (availability) updates.availability = availability;

      await vehicle.update(updates);

      const updatedVehicle = await Vehicle.findByPk(id, {
        include: [{ model: Driver, as: 'assignedDriver', attributes: ['firstName', 'lastName', 'email'] }]
      });

      res.json({ success: true, message: 'Vehicle status updated successfully', data: { vehicle: updatedVehicle } });
    } catch (error) {
      console.error('Update vehicle status error:', error);
      res.status(500).json({ success: false, message: 'Error updating vehicle status' });
    }
  }
);

// ------------------------- GET /api/vehicles/stats/overview -------------------------
router.get('/stats/overview',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const stats = await Vehicle.findAll({
        attributes: [
          [fn('COUNT', col('id')), 'totalVehicles'],
          [fn('SUM', literal("CASE WHEN status='active' THEN 1 ELSE 0 END")), 'activeVehicles'],
          [fn('SUM', literal("CASE WHEN availability='available' THEN 1 ELSE 0 END")), 'availableVehicles'],
          [fn('SUM', literal("CASE WHEN availability='in-use' THEN 1 ELSE 0 END")), 'inUseVehicles'],
          [fn('SUM', literal("CASE WHEN availability='maintenance' THEN 1 ELSE 0 END")), 'maintenanceVehicles'],
          [fn('SUM', literal("CASE WHEN availability='out-of-service' THEN 1 ELSE 0 END")), 'outOfServiceVehicles'],
          [fn('SUM', literal('"assignedDriverId" IS NOT NULL')), 'assignedVehicles'],
        ],
        raw: true
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

      res.json({ success: true, data: { overview } });
    } catch (error) {
      console.error('Get vehicle stats error:', error);
      res.status(500).json({ success: false, message: 'Error fetching vehicle statistics' });
    }
  }
);

export default router;
