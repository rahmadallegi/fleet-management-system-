import express from 'express';
import crypto from 'crypto';
import { Op } from 'sequelize';
import User from '../models/User.js';
import { generateToken, authenticate, authRateLimit, logAuthEvent } from '../middleware/auth.js';
import { authValidations } from '../middleware/validation.js';

const router = express.Router();

// REGISTER
router.post('/register', authRateLimit(3, 15 * 60 * 1000), logAuthEvent('REGISTER'), authValidations.register, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role = 'viewer', department, employeeId } = req.body;

    if (await User.findOne({ where: { email: email.toLowerCase() } })) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }
    if (employeeId && await User.findOne({ where: { employeeId } })) {
      return res.status(400).json({ success: false, message: 'Employee ID already exists' });
    }

    const user = await User.create({
      firstName, lastName, email: email.toLowerCase(), password, phone, role, department, employeeId
    });

    const token = generateToken(user.id);
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({ success: true, message: 'User registered successfully', data: { user: userResponse, token } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Error creating user', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// LOGIN
router.post('/login', logAuthEvent('LOGIN'), authValidations.login, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(401).json({ success: false, message: 'Account temporarily locked' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.update({ loginAttempts: user.loginAttempts + 1 });
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.loginAttempts > 0) await user.update({ loginAttempts: 0, lockUntil: null });
    await user.update({ lastLogin: new Date() });

    const token = generateToken(user.id);
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({ success: true, message: 'Login successful', data: { user: userResponse, token } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error during login', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// GET PROFILE
router.get('/me', authenticate, async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

// CHANGE PASSWORD
router.put('/change-password', authenticate, authValidations.changePassword, async (req, res) => {
  try {
    const { currentPassword, password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    await user.update({ password });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Error changing password' });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', authRateLimit(3, 60 * 60 * 1000), authValidations.forgotPassword, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return res.json({ success: true, message: 'If account exists, reset link sent' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await user.update({ passwordResetToken: hashedToken, passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000) });

    console.log(`Password reset token for ${email}: ${resetToken}`);
    res.json({ success: true, message: 'Password reset link sent', resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Error processing password reset request' });
  }
});

// RESET PASSWORD
router.post('/reset-password', authValidations.resetPassword, async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({ where: { passwordResetToken: hashedToken, passwordResetExpires: { [Op.gt]: new Date() } } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

    await user.update({ password, passwordResetToken: null, passwordResetExpires: null, loginAttempts: 0, lockUntil: null });
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
});

// LOGOUT
router.post('/logout', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

// VERIFY TOKEN
router.get('/verify-token', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Token is valid', data: { user: req.user } });
});

export default router;
