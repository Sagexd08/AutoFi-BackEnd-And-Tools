/**
 * Custom error classes for the Backend.
 * Provides standardized error handling with error codes and context.
 */

/**
 * Base error class for all backend errors.
 */
export class BackendError extends Error {
  /**
   * Creates a new BackendError instance.
   * 
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   * @param {Object} options.context - Additional context data
   * @param {boolean} options.recoverable - Whether the error is recoverable
   * @param {Error} options.cause - Original error that caused this error
   */
  constructor(code, message, options = {}) {
    super(message);
    this.name = 'BackendError';
    this.code = code;
    this.context = options.context || {};
    this.recoverable = options.recoverable ?? false;
    this.timestamp = new Date().toISOString();
    this.cause = options.cause;

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BackendError);
    }
  }

  /**
   * Converts the error to a JSON-serializable object.
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      recoverable: this.recoverable,
      timestamp: this.timestamp,
      stack: this.stack,
      ...(this.cause && { cause: this.cause.message }),
    };
  }
}

/**
 * Error thrown when validation fails.
 */
export class ValidationError extends BackendError {
  constructor(message, options = {}) {
    super('VALIDATION_ERROR', message, {
      ...options,
      recoverable: false,
    });
    this.name = 'ValidationError';
    this.field = options.field;
    this.value = options.value;
  }
}

/**
 * Error thrown when authentication fails.
 */
export class AuthenticationError extends BackendError {
  constructor(message = 'Authentication failed', options = {}) {
    super('AUTHENTICATION_ERROR', message, {
      ...options,
      recoverable: false,
    });
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when authorization fails.
 */
export class AuthorizationError extends BackendError {
  constructor(message = 'Authorization failed', options = {}) {
    super('AUTHORIZATION_ERROR', message, {
      ...options,
      recoverable: false,
    });
    this.name = 'AuthorizationError';
  }
}

/**
 * Error thrown when a resource is not found.
 */
export class NotFoundError extends BackendError {
  constructor(message = 'Resource not found', options = {}) {
    super('NOT_FOUND', message, {
      ...options,
      recoverable: false,
    });
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when rate limit is exceeded.
 */
export class RateLimitError extends BackendError {
  constructor(message = 'Rate limit exceeded', options = {}) {
    super('RATE_LIMIT_EXCEEDED', message, {
      ...options,
      recoverable: true,
    });
    this.name = 'RateLimitError';
  }
}

/**
 * Error thrown when an internal server error occurs.
 */
export class InternalServerError extends BackendError {
  constructor(message = 'Internal server error', options = {}) {
    super('INTERNAL_ERROR', message, {
      ...options,
      recoverable: false,
    });
    this.name = 'InternalServerError';
  }
}
