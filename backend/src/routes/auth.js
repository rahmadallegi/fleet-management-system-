import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken, authenticate, authRateLimit, logAuthEvent } from '../middleware/auth.js';
import { authValidations } from '../middleware/validation.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (but can be restricted to admin only)
router.post('/register',
  authRateLimit(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
  logAuthEvent('REGISTER'),
  authValidations.register,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, phone, role = 'viewer', department, employeeId } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Check if employee ID is already taken (if provided)
      if (employeeId) {
        const existingEmployee = await User.findOne({ where: { employeeId } });
        if (existingEmployee) {
          return res.status(400).json({
            success: false,
            message: 'Employee ID already exists'
          });
        }
      }

      // Create new user
      const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        phone,
        role,
        department,
        employeeId,
        createdBy: req.user?.id // If admin is creating the user
      });

      // Generate token
      const token = generateToken(user.id);

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          token
        }
      });

    } catch (error) {
      console.error('Registration error:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(error.fields)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  // authRateLimit(5, 15 * 60 * 1000), // temporarily disabled for debugging
  logAuthEvent('LOGIN'),
  authValidations.login,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ where: { email: email.toLowerCase() } });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > new Date()) {
        return res.status(401).json({
          success: false,
          message: 'Account is temporarily locked due to too many failed login attempts'
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive. Please contact administrator.'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        // Increment login attempts
        await user.update({ loginAttempts: user.loginAttempts + 1 });

        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.update({ loginAttempts: 0, lockUntil: null });
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Generate token
      const token = generateToken(user.id);

      // Remove sensitive data from response
      const userResponse = user.toJSON();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password',
  authenticate,
  authValidations.changePassword,
  async (req, res) => {
    try {
      const { currentPassword, password } = req.body;

      // Get user with password
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      await user.update({ password });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error changing password'
      });
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password',
  authRateLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  authValidations.forgotPassword,
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email: email.toLowerCase() } });

      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set reset token and expiry (10 minutes)
      await user.update({
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
      });

      // TODO: Send email with reset link
      // For now, just return the token (remove in production)
      console.log(`Password reset token for ${email}: ${resetToken}`);

      res.json({
        success: true,
        message: 'Password reset link has been sent to your email.',
        // Remove this in production
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing password reset request'
      });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password',
  authValidations.resetPassword,
  async (req, res) => {
    try {
      const { token, password } = req.body;

      // Hash the token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid reset token
      const user = await User.findOne({
        where: {
          passwordResetToken: hashedToken,
          passwordResetExpires: { [Op.gt]: new Date() },
        },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Update password and clear reset token
      await user.update({
        password,
        passwordResetToken: null,
        passwordResetExpires: null,
        loginAttempts: 0,
        lockUntil: null,
      });

      res.json({
        success: true,
        message: 'Password reset successful'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error resetting password'
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return success and let client remove the token

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
});

// @route   GET /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Private
router.get('/verify-token', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying token'
    });
  }
});

export default router;