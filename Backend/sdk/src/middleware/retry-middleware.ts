import type { Middleware, MiddlewareContext } from './types';
import { retryWithBackoff, type RetryConfig } from '../utils/retry';
import { SDKError } from '../errors';

/**
 * Retry middleware configuration.
 */
export interface RetryMiddlewareConfig {
  /** Retry configuration */
  retryConfig: Partial<RetryConfig>;
  /** Function to determine if context should be retried */
  shouldRetry?: (context: MiddlewareContext) => boolean;
}

/**
 * Creates a retry middleware.
 * 
 * @param config - Retry middleware configuration
 * @returns Retry middleware
 */
export function createRetryMiddleware(config: RetryMiddlewareConfig): Middleware {
  return {
    name: 'retry',
    config: {
      enabled: true,
      order: 3,
    },
    execute: async (context: MiddlewareContext, next: () => Promise<void>): Promise<void> => {
      const shouldRetry = config.shouldRetry ?? (() => true);

      if (!shouldRetry(context)) {
        await next();
        return;
      }

      try {
        await retryWithBackoff(
          async () => {
            await next();
          },
          {
            ...config.retryConfig,
            onRetry: (attempt, error) => {
              if (context.response) {
                context.response.metadata = {
                  ...context.response.metadata,
                  retryAttempt: attempt,
                  retryError: error instanceof Error ? error.message : String(error),
                };
              }
              config.retryConfig.onRetry?.(attempt, error);
            },
          }
        );
      } catch (error) {
        context.error = error;
        throw error;
      }
    },
  };
}
