import express from 'express';
import models from '../models/index.js';
const { User } = models;
import { authenticate, authorize } from '../middleware/auth.js';
import { userValidations, commonValidations } from '../middleware/validation.js';
import { Op } from 'sequelize';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with pagination and filtering
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
        role,
        isActive,
        search
      } = req.query;

      const maxLimit = 100; // Prevent huge queries
      const queryLimit = Math.min(parseInt(limit), maxLimit);
      const offset = (parseInt(page) - 1) * queryLimit;

      // Build filter object
      const where = {};
      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive.toString() === 'true';

      if (search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { employeeId: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const order = [[sortBy, sort.toUpperCase()]];

      const { count, rows: users } = await User.findAndCountAll({
        where,
        order,
        offset,
        limit: queryLimit,
        attributes: { exclude: ['password'] },
        include: [
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      const totalPages = Math.ceil(count / queryLimit);
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalUsers: count,
            hasNextPage,
            hasPrevPage,
            limit: queryLimit
          }
        }
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users'
      });
    }
  }
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin, Dispatcher, or own profile)
router.get('/:id',
  authenticate,
  userValidations.getById,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.role !== 'admin' && req.user.role !== 'dispatcher' && req.user.id.toString() !== id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own profile.'
        });
      }

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({ success: true, data: { user } });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ success: false, message: 'Error fetching user' });
    }
  }
);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/',
  authenticate,
  authorize('admin'),
  userValidations.create,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, phone, role, department, employeeId } = req.body;

      const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        phone,
        role,
        department,
        employeeId,
        createdById: req.user.id
      });

      const userResponse = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] },
        include: [{ model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] }]
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user: userResponse }
      });

    } catch (error) {
      console.error('Create user error:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(error.fields)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }

      res.status(500).json({ success: false, message: 'Error creating user' });
    }
  }
);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin, or own profile with limited fields)
router.put('/:id',
  authenticate,
  userValidations.update,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const isOwnProfile = req.user.id.toString() === id;
      const isAdmin = req.user.role === 'admin';

      if (!isAdmin && !isOwnProfile) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own profile.'
        });
      }

      if (!isAdmin) {
        const allowedFields = ['firstName', 'lastName', 'phone', 'preferences'];
        const restrictedFields = Object.keys(updates).filter(field => !allowedFields.includes(field));

        if (restrictedFields.length > 0) {
          return res.status(403).json({
            success: false,
            message: `Access denied. You cannot update: ${restrictedFields.join(', ')}`
          });
        }
      }

      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      updates.updatedById = req.user.id;
      await user.update(updates);

      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          { model: User, as: 'createdBy', attributes: ['firstName', 'lastName', 'email'] },
          { model: User, as: 'updatedBy', attributes: ['firstName', 'lastName', 'email'] },
        ]
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });

    } catch (error) {
      console.error('Update user error:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(error.fields)[0];
        return res.status(400).json({ success: false, message: `${field} already exists` });
      }

      res.status(500).json({ success: false, message: 'Error updating user' });
    }
  }
);

// @route   DELETE /api/users/:id
// @desc    Soft delete user
// @access  Private (Admin only)
router.delete('/:id',
  authenticate,
  authorize('admin'),
  userValidations.getById,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (req.user.id.toString() === id) {
        return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
      }

      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      await user.update({ isActive: false, updatedById: req.user.id });

      res.json({ success: true, message: 'User deactivated successfully' });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ success: false, message: 'Error deleting user' });
    }
  }
);

// @route   PUT /api/users/:id/activate
// @desc    Activate user account
// @access  Private (Admin only)
router.put('/:id/activate',
  authenticate,
  authorize('admin'),
  userValidations.getById,
  async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      await user.update({ isActive: true, updatedById: req.user.id });

      const updatedUser = await User.findByPk(id, { attributes: { exclude: ['password'] } });

      res.json({ success: true, message: 'User activated successfully', data: { user: updatedUser } });

    } catch (error) {
      console.error('Activate user error:', error);
      res.status(500).json({ success: false, message: 'Error activating user' });
    }
  }
);

// @route   PUT /api/users/:id/unlock
// @desc    Unlock user account
// @access  Private (Admin only)
router.put('/:id/unlock',
  authenticate,
  authorize('admin'),
  userValidations.getById,
  async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      // Only update if locked
      if (user.loginAttempts > 0 || user.lockUntil) {
        await user.update({ loginAttempts: 0, lockUntil: null, updatedById: req.user.id });
      }

      res.json({ success: true, message: 'User account unlocked successfully' });

    } catch (error) {
      console.error('Unlock user error:', error);
      res.status(500).json({ success: false, message: 'Error unlocking user account' });
    }
  }
);

export default router;
