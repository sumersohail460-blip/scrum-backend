const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const categoryRoutes = require('./categoryRoutes');
const itemRoutes = require('./itemRoutes');
const { rateLimiter } = require('../middlewares/rateLimiterMiddleware');
const { errorResponse } = require('../utils/apiResponseUtil');
const router = express.Router();

// Apply rate limiter globally
router.use(rateLimiter);

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/categories', categoryRoutes);
router.use('/items', itemRoutes);

// Health check endpoint
router.get('/health', async (req, res) => {
  const prisma = require('../config/dbConfig');
  
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../../package.json').version,
    database: 'Connected',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    healthCheck.status = 'ERROR';
    healthCheck.database = 'Disconnected';
    return res.status(503).json(healthCheck);
  }

  res.json(healthCheck);
});

// 404 Handler: This will catch all undefined routes
router.use((req, res) => {
  return errorResponse(res, 'Route not found', 404);
});

module.exports = router;