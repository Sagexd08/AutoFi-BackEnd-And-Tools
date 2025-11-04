import { BackendError } from '../utils/errors.js';

/**
 * Error handler middleware for Express.
 * Standardizes error responses and handles different error types.
 */
export function errorHandler(err, req, res, next) {
  // Log the error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    context: err.context,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Handle known error types
  if (err instanceof BackendError) {
    const statusCode = getStatusCode(err.code);
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        context: err.context,
        recoverable: err.recoverable,
        timestamp: err.timestamp,
      },
    });
  }

  // Handle validation errors (from Zod or other validators)
  if (err.name === 'ZodError' || err.errors) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors || err.message,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Handle default errors
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An internal error occurred' 
        : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Gets HTTP status code from error code.
 */
function getStatusCode(code) {
  const statusMap = {
    VALIDATION_ERROR: 400,
    AUTHENTICATION_ERROR: 401,
    AUTHORIZATION_ERROR: 403,
    NOT_FOUND: 404,
    RATE_LIMIT_EXCEEDED: 429,
    INTERNAL_ERROR: 500,
    NETWORK_ERROR: 502,
    SERVICE_UNAVAILABLE: 503,
  };

  return statusMap[code] || 500;
}

/**
 * Async error wrapper for Express route handlers.
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
