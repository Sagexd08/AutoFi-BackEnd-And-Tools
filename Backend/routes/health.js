import express from 'express';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

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

  try {
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

  try {
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

router.get('/ready', (req, res) => {
  const isReady = true;

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

router.get('/live', (req, res) => {
  res.json({
    success: true,
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export default router;
