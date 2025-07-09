import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import configurations
import config from './src/config/config.js';
import connectDB from './src/config/database.js';
import { initializeDatabase } from './src/models/index.js';
import apiRoutes from './src/routes/index.js';

const app = express();
const PORT = config.PORT;

// Rate limiting (temporarily disabled for debugging)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased limit for debugging
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('combined')); // Logging
// app.use(limiter); // Rate limiting temporarily disabled
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection will be handled in startServer function

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Fleet Management System API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Import mongoose to check connection status
    const mongoose = await import('mongoose');

    res.status(200).json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      database: mongoose.default.connection.readyState === 1 ? 'connected' : 'disconnected',
      models: [
        'User', 'Vehicle', 'Driver', 'Trip',
        'Location', 'FuelLog', 'Maintenance', 'Alert'
      ]
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// API Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: config.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const startServer = async () => {
  try {
    // Try to connect to database, but don't fail if it's not available
    try {
      await connectDB();
      await initializeDatabase();
      console.log(`📋 Database connected and models initialized`);
    } catch (dbError) {
      console.log(`⚠️ Database not available, starting without database connection`);
      console.log(`💡 To use database features, please start MongoDB on localhost:27017`);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`🎯 Frontend URL: ${config.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown is handled in the database connection file
