import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import sequelize from './src/config/sequelize.js';
import config from './src/config/config.js';
import apiRoutes from './src/routes/index.js';
import reportsRoutes from './src/routes/reports.js';

const app = express();
const PORT = config.PORT || 5000;

// Rate limiter (optional)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(morgan('combined'));
// app.use(limiter);
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Fleet Management System API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      database: 'SQL Server connected',
      models: [
        'User', 'Vehicle', 'Driver', 'Trip',
        'Location', 'FuelLog', 'Maintenance', 'Alert'
      ]
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', message: error.message });
  }
});

// API routes
app.use('/api', apiRoutes);
app.use('/api/reports', reportsRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: config.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('📋 SQL Server connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`🎯 Frontend URL: ${config.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
