import type { SDKConfig } from '../types/config';

/**
 * Log levels.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Structured log entry.
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
  correlationId?: string;
}

/**
 * Logger interface.
 */
export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
}

/**
 * Structured logger implementation.
 */
export class StructuredLogger implements Logger {
  private readonly logLevel: LogLevel;
  private correlationId?: string;

  constructor(config: SDKConfig) {
    const level = config.logLevel ?? 'info';
    this.logLevel = this.parseLogLevel(level);
  }

  /**
   * Parses log level string to enum.
   */
  private parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Sets the correlation ID for request tracking.
   */
  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  /**
   * Gets the current correlation ID.
   */
  getCorrelationId(): string | undefined {
    return this.correlationId;
  }

  /**
   * Logs a message at debug level.
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, undefined, context);
  }

  /**
   * Logs a message at info level.
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, undefined, context);
  }

  /**
   * Logs a message at warn level.
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, undefined, context);
  }

  /**
   * Logs a message at error level.
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, error, context);
  }

  /**
   * Internal logging method.
   */
  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    if (level < this.logLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        ...(this.correlationId && { correlationId: this.correlationId }),
      },
      ...(error && { error }),
    };

    const logOutput = JSON.stringify(entry, null, 2);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logOutput);
        break;
      case LogLevel.INFO:
        console.info(logOutput);
        break;
      case LogLevel.WARN:
        console.warn(logOutput);
        break;
      case LogLevel.ERROR:
        console.error(logOutput);
        break;
    }
  }
}
