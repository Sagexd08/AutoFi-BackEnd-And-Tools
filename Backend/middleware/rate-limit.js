import rateLimit from 'express-rate-limit';

/**
 * Rate limiting configuration and middleware.
 */

/**
 * Creates a rate limiter with custom configuration.
 * 
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Custom error message
 * @param {boolean} options.standardHeaders - Enable standard rate limit headers
 * @param {boolean} options.legacyHeaders - Enable legacy rate limit headers
 * @returns {Function} Express rate limit middleware
 */
export function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later.',
    standardHeaders = true,
    legacyHeaders = false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        timestamp: new Date().toISOString(),
      },
    },
    standardHeaders,
    legacyHeaders,
    // Skip rate limiting for successful requests
    skip: (req) => false,
    // Custom key generator (can be IP-based or user-based)
    keyGenerator: (req) => {
      // Use API key if available, otherwise use IP
      return req.headers['x-api-key'] || req.ip || req.connection.remoteAddress;
    },
    // Custom handler
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          timestamp: new Date().toISOString(),
          retryAfter: Math.ceil(windowMs / 1000),
        },
      });
    },
  });
}

/**
 * Strict rate limiter for sensitive endpoints.
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: 'Too many requests to this sensitive endpoint. Please try again later.',
});

/**
 * Standard rate limiter for general API endpoints.
 */
export const standardRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests. Please try again later.',
});

/**
 * Lenient rate limiter for public endpoints.
 */
export const lenientRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Rate limit exceeded. Please slow down.',
});

/**
 * Rate limiter for authentication endpoints.
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again later.',
});

/**
 * Rate limiter for transaction endpoints.
 */
export const transactionRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 transactions per minute
  message: 'Transaction rate limit exceeded. Please wait before sending more transactions.',
});

/**
 * Rate limiter for AI agent endpoints.
 */
export const agentRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 agent requests per minute
  message: 'AI agent rate limit exceeded. Please wait before making more requests.',
});
