export class BackendError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = 'BackendError';
    this.code = code;
    this.context = options.context || {};
    this.recoverable = options.recoverable ?? false;
    this.timestamp = new Date().toISOString();
    this.cause = options.cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BackendError);
    }
  }

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

export class AuthenticationError extends BackendError {
  constructor(message = 'Authentication failed', options = {}) {
    super('AUTHENTICATION_ERROR', message, {
      ...options,
      recoverable: false,
    });
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends BackendError {
  constructor(message = 'Authorization failed', options = {}) {
    super('AUTHORIZATION_ERROR', message, {
      ...options,
      recoverable: false,
    });
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends BackendError {
  constructor(message = 'Resource not found', options = {}) {
    super('NOT_FOUND', message, {
      ...options,
      recoverable: false,
    });
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends BackendError {
  constructor(message = 'Rate limit exceeded', options = {}) {
    super('RATE_LIMIT_EXCEEDED', message, {
      ...options,
      recoverable: true,
    });
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends BackendError {
  constructor(message = 'Internal server error', options = {}) {
    super('INTERNAL_ERROR', message, {
      ...options,
      recoverable: false,
    });
    this.name = 'InternalServerError';
  }
}
