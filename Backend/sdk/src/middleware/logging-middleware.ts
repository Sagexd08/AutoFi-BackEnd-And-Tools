import type { Middleware, MiddlewareContext } from './types';
import type { SDKConfig } from '../types/config';

/**
 * Creates a logging middleware.
 * 
 * @param config - SDK configuration for log level
 * @returns Logging middleware
 */
export function createLoggingMiddleware(config: SDKConfig): Middleware {
  const logLevel = config.logLevel ?? 'info';
  const logLevels = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = logLevels.indexOf(logLevel);

  const shouldLog = (level: string): boolean => {
    const levelIndex = logLevels.indexOf(level);
    return levelIndex >= currentLevelIndex;
  };

  return {
    name: 'logging',
    config: {
      enabled: true,
      order: 1,
    },
    execute: async (context: MiddlewareContext, next: () => Promise<void>): Promise<void> => {
      const startTime = Date.now();

      if (shouldLog('debug')) {
        console.debug(`[Middleware] ${context.request.id} - Starting request`, {
          path: context.request.path,
          metadata: context.request.metadata,
        });
      }

      try {
        await next();

        const duration = Date.now() - startTime;
        context.response = {
          timestamp: Date.now(),
          duration,
          metadata: context.response?.metadata,
        };

        if (shouldLog('info')) {
          console.info(`[Middleware] ${context.request.id} - Request completed`, {
            duration: `${duration}ms`,
            path: context.request.path,
          });
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        context.error = error;

        if (shouldLog('error')) {
          console.error(`[Middleware] ${context.request.id} - Request failed`, {
            duration: `${duration}ms`,
            path: context.request.path,
            error: error instanceof Error ? error.message : String(error),
          });
        }

        throw error;
      }
    },
  };
}
