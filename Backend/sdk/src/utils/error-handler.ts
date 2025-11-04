import { SDKError, isSDKError, extractErrorInfo } from '../errors';
import { ERROR_CODES } from '../constants/errors';

/**
 * Error handler utility for managing and tracking errors.
 * Provides error counting, categorization, and recovery strategies.
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCount: Map<string, number> = new Map();
  private errorHistory: SDKError[] = [];
  private readonly maxHistorySize: number = 1000;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handles an error, tracking it and extracting useful information.
   * 
   * @param error - The error to handle
   * @param context - Optional context string for categorization
   * @returns The extracted error information
   */
  handleError(error: unknown, context?: string): ReturnType<typeof extractErrorInfo> {
    const errorInfo = extractErrorInfo(error);
    const errorKey = context || errorInfo.code || 'unknown';
    
    const currentCount = this.errorCount.get(errorKey) ?? 0;
    this.errorCount.set(errorKey, currentCount + 1);
    
    // Store SDK errors in history
    if (isSDKError(error)) {
      this.addToHistory(error);
    }
    
    // Log the error
    const logMessage = `[${errorKey}] ${errorInfo.message}`;
    if (errorInfo.recoverable) {
      console.warn(logMessage);
    } else {
      console.error(logMessage);
    }
    
    return errorInfo;
  }

  /**
   * Adds an error to the history, maintaining max size.
   */
  private addToHistory(error: SDKError): void {
    this.errorHistory.push(error);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }

  /**
   * Gets the count of errors for a specific context or code.
   */
  getErrorCount(context?: string): number {
    if (context) {
      return this.errorCount.get(context) ?? 0;
    }
    
    return Array.from(this.errorCount.values()).reduce((sum, count) => sum + count, 0);
  }

  /**
   * Gets error statistics grouped by error code.
   */
  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [key, count] of this.errorCount.entries()) {
      stats[key] = count;
    }
    return stats;
  }

  /**
   * Gets recent error history.
   */
  getErrorHistory(limit?: number): readonly SDKError[] {
    if (limit) {
      return this.errorHistory.slice(-limit);
    }
    return [...this.errorHistory];
  }

  /**
   * Resets error count for a specific context or all errors.
   */
  resetErrorCount(context?: string): void {
    if (context) {
      this.errorCount.delete(context);
    } else {
      this.errorCount.clear();
    }
  }

  /**
   * Clears error history.
   */
  clearHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Checks if an error is recoverable.
   */
  isRecoverable(error: unknown): boolean {
    if (isSDKError(error)) {
      return error.recoverable;
    }
    return false;
  }

  /**
   * Gets recovery strategy suggestions for an error.
   */
  getRecoveryStrategy(error: unknown): string[] {
    const errorInfo = extractErrorInfo(error);
    const strategies: string[] = [];

    if (errorInfo.code === ERROR_CODES.NETWORK_ERROR || errorInfo.code === ERROR_CODES.NETWORK_TIMEOUT) {
      strategies.push('Retry the operation after a short delay');
      strategies.push('Check network connectivity');
      strategies.push('Verify RPC endpoint is accessible');
    } else if (errorInfo.code === ERROR_CODES.RATE_LIMIT_EXCEEDED) {
      strategies.push('Wait before retrying');
      strategies.push('Reduce request frequency');
    } else if (errorInfo.code === ERROR_CODES.INSUFFICIENT_FUNDS) {
      strategies.push('Ensure sufficient balance for transaction and gas');
      strategies.push('Check account balance');
    } else if (errorInfo.code === ERROR_CODES.GAS_ESTIMATION_FAILED) {
      strategies.push('Manually specify gas limit');
      strategies.push('Verify transaction parameters');
    } else if (errorInfo.recoverable) {
      strategies.push('Retry the operation');
    }

    return strategies;
  }
}
