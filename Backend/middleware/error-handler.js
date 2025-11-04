import { BackendError } from '../utils/errors.js';

export function errorHandler(err, req, res, next) {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    context: err.context,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

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

  if (err.name === 'ZodError' || (err.name === 'ValidationError' && err.errors)) {
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

  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
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

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
