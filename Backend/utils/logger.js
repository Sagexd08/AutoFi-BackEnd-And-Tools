/**
 * Structured logging system with correlation IDs and log levels.
 */

/**
 * Log levels.
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

/**
 * Structured logger implementation.
 */
export class Logger {
  constructor(config = {}) {
    this.logLevel = config.logLevel || process.env.LOG_LEVEL || 'info';
    this.levelValue = this.parseLogLevel(this.logLevel);
    this.correlationId = null;
  }

  /**
   * Parses log level string to numeric value.
   */
  parseLogLevel(level) {
    const levelMap = {
      debug: LogLevel.DEBUG,
      info: LogLevel.INFO,
      warn: LogLevel.WARN,
      error: LogLevel.ERROR,
    };
    return levelMap[level.toLowerCase()] ?? LogLevel.INFO;
  }

  /**
   * Sets correlation ID for request tracking.
   */
  setCorrelationId(id) {
    this.correlationId = id;
  }

  /**
   * Generates a correlation ID.
   */
  generateCorrelationId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Creates a log entry.
   */
  createLogEntry(level, message, error, context) {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      correlationId: this.correlationId,
      ...(context && { context }),
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          ...(error.code && { code: error.code }),
          ...(error.context && { context: error.context }),
        },
      }),
    };
  }

  /**
   * Logs a message at debug level.
   */
  debug(message, context) {
    if (this.levelValue <= LogLevel.DEBUG) {
      const entry = this.createLogEntry('DEBUG', message, null, context);
      console.debug(JSON.stringify(entry));
    }
  }

  /**
   * Logs a message at info level.
   */
  info(message, context) {
    if (this.levelValue <= LogLevel.INFO) {
      const entry = this.createLogEntry('INFO', message, null, context);
      console.info(JSON.stringify(entry));
    }
  }

  /**
   * Logs a message at warn level.
   */
  warn(message, context) {
    if (this.levelValue <= LogLevel.WARN) {
      const entry = this.createLogEntry('WARN', message, null, context);
      console.warn(JSON.stringify(entry));
    }
  }

  /**
   * Logs a message at error level.
   */
  error(message, error, context) {
    if (this.levelValue <= LogLevel.ERROR) {
      const entry = this.createLogEntry('ERROR', message, error, context);
      console.error(JSON.stringify(entry));
    }
  }
}

/**
 * Express middleware for request logging with correlation IDs.
 */
export function requestLogger(logger) {
  return (req, res, next) => {
    const correlationId = req.headers['x-correlation-id'] || logger.generateCorrelationId();
    logger.setCorrelationId(correlationId);
    req.correlationId = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);

    const startTime = Date.now();

    logger.info('Request started', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info('Request completed', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  };
}

/**
 * Default logger instance.
 */
export const logger = new Logger();
