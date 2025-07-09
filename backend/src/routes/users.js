import express from 'express';
import { User } from '../models/index.js';
import { authenticate, authorize, authorizeOwnerOrAdmin } from '../middleware/auth.js';
import { userValidations, commonValidations } from '../middleware/validation.js';

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

      // Build filter object
      const filter = {};
      
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sortOrder = sort === 'desc' ? -1 : 1;
      const sortObj = { [sortBy]: sortOrder };

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .sort(sortObj)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('createdBy', 'firstName lastName email')
          .populate('updatedBy', 'firstName lastName email'),
        User.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalUsers: total,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
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

      // Check if user can access this profile
      if (req.user.role !== 'admin' && req.user.role !== 'dispatcher' && req.user._id.toString() !== id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own profile.'
        });
      }

      const user = await User.findById(id)
        .select('-password')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user'
      });
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

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Check if employee ID is already taken (if provided)
      if (employeeId) {
        const existingEmployee = await User.findOne({ employeeId });
        if (existingEmployee) {
          return res.status(400).json({
            success: false,
            message: 'Employee ID already exists'
          });
        }
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        phone,
        role,
        department,
        employeeId,
        createdBy: req.user._id
      });

      await user.save();

      // Remove password from response
      const userResponse = await User.findById(user._id)
        .select('-password')
        .populate('createdBy', 'firstName lastName email');

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user: userResponse }
      });

    } catch (error) {
      console.error('Create user error:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating user'
      });
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

      // Check permissions
      const isOwnProfile = req.user._id.toString() === id;
      const isAdmin = req.user.role === 'admin';

      if (!isAdmin && !isOwnProfile) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own profile.'
        });
      }

      // Restrict fields for non-admin users
      if (!isAdmin) {
        const allowedFields = ['firstName', 'lastName', 'phone', 'preferences'];
        const updateFields = Object.keys(updates);
        const restrictedFields = updateFields.filter(field => !allowedFields.includes(field));
        
        if (restrictedFields.length > 0) {
          return res.status(403).json({
            success: false,
            message: `Access denied. You cannot update: ${restrictedFields.join(', ')}`
          });
        }
      }

      // Find user
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check for email uniqueness if email is being updated
      if (updates.email && updates.email !== user.email) {
        const existingUser = await User.findOne({ email: updates.email.toLowerCase() });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
        updates.email = updates.email.toLowerCase();
      }

      // Check for employee ID uniqueness if being updated
      if (updates.employeeId && updates.employeeId !== user.employeeId) {
        const existingEmployee = await User.findOne({ employeeId: updates.employeeId });
        if (existingEmployee) {
          return res.status(400).json({
            success: false,
            message: 'Employee ID already exists'
          });
        }
      }

      // Update user
      updates.updatedBy = req.user._id;
      const updatedUser = await User.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      )
        .select('-password')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });

    } catch (error) {
      console.error('Update user error:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating user'
      });
    }
  }
);

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete by setting isActive to false)
// @access  Private (Admin only)
router.delete('/:id',
  authenticate,
  authorize('admin'),
  userValidations.getById,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (req.user._id.toString() === id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Soft delete by setting isActive to false
      user.isActive = false;
      user.updatedBy = req.user._id;
      await user.save();

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting user'
      });
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

      const user = await User.findByIdAndUpdate(
        id,
        { 
          isActive: true,
          updatedBy: req.user._id
        },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User activated successfully',
        data: { user }
      });

    } catch (error) {
      console.error('Activate user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error activating user'
      });
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

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Reset login attempts and unlock
      await user.resetLoginAttempts();
      user.updatedBy = req.user._id;
      await user.save();

      res.json({
        success: true,
        message: 'User account unlocked successfully'
      });

    } catch (error) {
      console.error('Unlock user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error unlocking user account'
      });
    }
  }
);

// @route   GET /api/users/stats/overview
// @desc    Get user statistics overview
// @access  Private (Admin, Dispatcher)
router.get('/stats/overview',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
            inactiveUsers: { $sum: { $cond: ['$isActive', 0, 1] } },
            adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
            dispatcherUsers: { $sum: { $cond: [{ $eq: ['$role', 'dispatcher'] }, 1, 0] } },
            driverUsers: { $sum: { $cond: [{ $eq: ['$role', 'driver'] }, 1, 0] } },
            viewerUsers: { $sum: { $cond: [{ $eq: ['$role', 'viewer'] }, 1, 0] } }
          }
        }
      ]);

      const overview = stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        adminUsers: 0,
        dispatcherUsers: 0,
        driverUsers: 0,
        viewerUsers: 0
      };

      res.json({
        success: true,
        data: { overview }
      });

    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user statistics'
      });
    }
  }
);

export default router;
