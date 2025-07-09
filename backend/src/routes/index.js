import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import vehicleRoutes from './vehicles.js';
import driverRoutes from './drivers.js';
import tripRoutes from './trips.js';
import fuelRoutes from './fuel.js';
import maintenanceRoutes from './maintenance.js';
import alertRoutes from './alerts.js';
import dashboardRoutes from './dashboard.js';

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/fuel', fuelRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/alerts', alertRoutes);
router.use('/dashboard', dashboardRoutes);

// API Documentation endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Fleet Management System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        base: '/api/auth',
        endpoints: [
          'POST /register - Register new user',
          'POST /login - User login',
          'GET /me - Get current user profile',
          'PUT /change-password - Change password',
          'POST /forgot-password - Request password reset',
          'POST /reset-password - Reset password with token',
          'POST /logout - Logout user',
          'GET /verify-token - Verify token validity'
        ]
      },
      users: {
        base: '/api/users',
        endpoints: [
          'GET / - Get all users (paginated)',
          'GET /:id - Get user by ID',
          'POST / - Create new user',
          'PUT /:id - Update user',
          'DELETE /:id - Deactivate user',
          'PUT /:id/activate - Activate user',
          'PUT /:id/unlock - Unlock user account',
          'GET /stats/overview - Get user statistics'
        ]
      },
      vehicles: {
        base: '/api/vehicles',
        endpoints: [
          'GET / - Get all vehicles (paginated)',
          'GET /available - Get available vehicles',
          'GET /:id - Get vehicle by ID',
          'POST / - Create new vehicle',
          'PUT /:id - Update vehicle',
          'DELETE /:id - Retire vehicle',
          'PUT /:id/assign-driver - Assign driver to vehicle',
          'PUT /:id/unassign-driver - Unassign driver from vehicle',
          'PUT /:id/status - Update vehicle status',
          'GET /stats/overview - Get vehicle statistics'
        ]
      },
      drivers: {
        base: '/api/drivers',
        endpoints: [
          'GET / - Get all drivers (paginated)',
          'GET /available - Get available drivers',
          'GET /:id - Get driver by ID',
          'POST / - Create new driver',
          'PUT /:id - Update driver',
          'DELETE /:id - Terminate driver',
          'PUT /:id/status - Update driver status',
          'GET /:id/performance - Get driver performance',
          'GET /stats/overview - Get driver statistics'
        ]
      },
      trips: {
        base: '/api/trips',
        endpoints: [
          'GET / - Get all trips (paginated)',
          'GET /active - Get active trips',
          'GET /:id - Get trip by ID',
          'POST / - Create new trip',
          'PUT /:id - Update trip',
          'PUT /:id/start - Start trip',
          'PUT /:id/complete - Complete trip',
          'PUT /:id/cancel - Cancel trip',
          'GET /stats/overview - Get trip statistics'
        ]
      },
      fuel: {
        base: '/api/fuel',
        endpoints: [
          'GET / - Get all fuel logs (paginated)',
          'GET /:id - Get fuel log by ID',
          'POST / - Create new fuel log',
          'PUT /:id - Update fuel log',
          'PUT /:id/verify - Verify fuel log',
          'PUT /:id/approve - Approve fuel log',
          'GET /vehicle/:vehicleId/efficiency - Get fuel efficiency',
          'GET /stats/overview - Get fuel statistics'
        ]
      },
      maintenance: {
        base: '/api/maintenance',
        endpoints: [
          'GET / - Get all maintenance records (paginated)',
          'GET /overdue - Get overdue maintenance',
          'GET /upcoming - Get upcoming maintenance',
          'GET /:id - Get maintenance record by ID',
          'POST / - Create new maintenance record',
          'PUT /:id - Update maintenance record',
          'PUT /:id/start - Start maintenance work',
          'PUT /:id/complete - Complete maintenance work',
          'PUT /:id/approve - Approve maintenance record',
          'GET /vehicle/:vehicleId/history - Get maintenance history',
          'GET /stats/overview - Get maintenance statistics'
        ]
      },
      alerts: {
        base: '/api/alerts',
        endpoints: [
          'GET / - Get all alerts (paginated)',
          'GET /active - Get active alerts',
          'GET /unacknowledged - Get unacknowledged alerts',
          'GET /:id - Get alert by ID',
          'POST / - Create new alert',
          'PUT /:id/acknowledge - Acknowledge alert',
          'PUT /:id/resolve - Resolve alert',
          'PUT /:id/dismiss - Dismiss alert',
          'GET /vehicle/:vehicleId - Get vehicle alerts',
          'GET /driver/:driverId - Get driver alerts',
          'GET /stats/overview - Get alert statistics'
        ]
      }
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
      note: 'Most endpoints require authentication. Use /auth/login to get a token.'
    },
    roles: {
      admin: 'Full access to all resources',
      dispatcher: 'Manage vehicles, drivers, trips, and view reports',
      driver: 'View assigned vehicles and trips, update trip status',
      viewer: 'Read-only access to basic information'
    }
  });
});

// Health check for API routes
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API routes are healthy',
    timestamp: new Date().toISOString(),
    routes: {
      auth: 'active',
      users: 'active',
      vehicles: 'active',
      drivers: 'active',
      trips: 'active',
      fuel: 'active',
      maintenance: 'active',
      alerts: 'active'
    }
  });
});

export default router;
