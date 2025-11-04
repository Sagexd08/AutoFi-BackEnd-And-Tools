import express from 'express';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * Basic health check endpoint.
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Detailed health check endpoint.
 */
router.get('/detailed', async (req, res) => {
  const health = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {},
    system: {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
    },
  };

  // Check database connection
  try {
    // Add database health check here if needed
    health.services.database = {
      status: 'healthy',
      responseTime: 0,
    };
  } catch (error) {
    health.services.database = {
      status: 'unhealthy',
      error: error.message,
    };
    health.status = 'degraded';
  }

  // Check blockchain connection
  try {
    // Add blockchain health check here if needed
    health.services.blockchain = {
      status: 'healthy',
      responseTime: 0,
    };
  } catch (error) {
    health.services.blockchain = {
      status: 'unhealthy',
      error: error.message,
    };
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * Readiness probe endpoint.
 */
router.get('/ready', (req, res) => {
  // Check if the application is ready to serve traffic
  const isReady = true; // Add readiness checks here

  if (isReady) {
    res.json({
      success: true,
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      success: false,
      status: 'not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Liveness probe endpoint.
 */
router.get('/live', (req, res) => {
  // Check if the application is alive
  res.json({
    success: true,
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export default router;
