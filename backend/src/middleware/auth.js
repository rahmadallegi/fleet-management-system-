import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/config.js';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
      });
    }

    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Account is inactive.',
      });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Account is locked.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token expired.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.userId);

    req.user = user && user.isActive && (!user.lockUntil || user.lockUntil < new Date()) ? user : null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};

// Check if user owns resource or has admin role
export const authorizeOwnerOrAdmin = (resourceUserField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const resourceUserId = req.params[resourceUserField] || req.body[resourceUserField];

    if (req.user.id.toString() === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.',
    });
  };
};