import jwt from 'jsonwebtoken';
import { sql } from '../database/db.js';
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
    if (!authHeader) return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) return res.status(401).json({ success: false, message: 'Access denied. Invalid token format.' });

    const decoded = verifyToken(token);
    const result = await sql.query`SELECT * FROM Users WHERE Id = ${decoded.userId}`;
    const user = result.recordset[0];

    if (!user) return res.status(401).json({ success: false, message: 'Access denied. User not found.' });
    if (!user.IsActive) return res.status(401).json({ success: false, message: 'Access denied. Account is inactive.' });
    if (user.LockUntil && new Date(user.LockUntil) > new Date()) {
      return res.status(401).json({ success: false, message: 'Access denied. Account is locked.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token.' });
    if (error.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired.' });
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
};

// Optional authentication middleware
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) return next();

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) return next();

    const decoded = verifyToken(token);
    const result = await sql.query`SELECT * FROM Users WHERE Id = ${decoded.userId}`;
    const user = result.recordset[0];

    req.user = user && user.IsActive && (!user.LockUntil || new Date(user.LockUntil) < new Date()) ? user : null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required.' });
    if (!roles.includes(req.user.Role)) {
      return res.status(403).json({ success: false, message: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
};

// Owner or admin check
export const authorizeOwnerOrAdmin = (resourceUserField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required.' });
    if (req.user.Role === 'admin') return next();

    const resourceUserId = req.params[resourceUserField] || req.body[resourceUserField];
    if (req.user.Id.toString() === resourceUserId) return next();

    return res.status(403).json({ success: false, message: 'Access denied. You can only access your own resources.' });
  };
};

// Rate limiting
export const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + (req.body.email || '');
    const now = Date.now();

    for (const [k, v] of attempts.entries()) {
      if (now - v.firstAttempt > windowMs) attempts.delete(k);
    }

    const userAttempts = attempts.get(key);
    if (!userAttempts) {
      attempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json({ success: false, message: 'Too many authentication attempts. Please try again later.' });
    }

    userAttempts.count++;
    next();
  };
};

// Log auth events
export const logAuthEvent = (event) => {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
      if (res.statusCode < 400) {
        console.log(`🔐 Auth Event: ${event} - User: ${req.user?.Email || req.body?.email || 'Unknown'} - IP: ${req.ip}`);
      } else {
        console.log(`❌ Auth Failed: ${event} - Email: ${req.body?.email || 'Unknown'} - IP: ${req.ip} - Status: ${res.statusCode}`);
      }
      originalSend.call(this, data);
    };
    next();
  };
};

// Vehicle access check
export const authorizeVehicleAccess = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required.' });
    if (req.user.Role === 'admin') return next();

    const vehicleId = req.params.vehicleId || req.params.id;
    if (!vehicleId) return res.status(400).json({ success: false, message: 'Vehicle ID is required.' });

    if (req.user.Role === 'driver') {
      const result = await sql.query`SELECT * FROM Vehicles WHERE Id = ${vehicleId}`;
      const vehicle = result.recordset[0];

      if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
      if (vehicle.AssignedDriverId?.toString() !== req.user.Id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only access your assigned vehicle.' });
      }
    }

    next();
  } catch (error) {
    console.error('Vehicle authorization error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during authorization.' });
  }
};
