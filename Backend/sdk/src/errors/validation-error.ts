import { SDKError } from './base';
import { ERROR_CODES } from '../constants/errors';

/**
 * Error thrown when validation fails.
 */
export class ValidationError extends SDKError {
  public readonly field?: string;
  public readonly value?: unknown;
  public readonly reason?: string;

  /**
   * Creates a new ValidationError instance.
   * 
   * @param message - Error message
   * @param options - Additional error options
   * @param options.field - Field that failed validation
   * @param options.value - Value that failed validation
   * @param options.reason - Reason for validation failure
   * @param options.context - Additional context data
   * @param options.cause - Original error that caused this error
   */
  constructor(
    message: string,
    options: {
      field?: string;
      value?: unknown;
      reason?: string;
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(ERROR_CODES.VALIDATION_ERROR, message, {
      context: {
        field: options.field,
        value: options.value,
        reason: options.reason,
        ...options.context,
      },
      recoverable: false,
      cause: options.cause,
    });
    this.name = 'ValidationError';
    this.field = options.field;
    this.value = options.value;
    this.reason = options.reason;
  }
}
