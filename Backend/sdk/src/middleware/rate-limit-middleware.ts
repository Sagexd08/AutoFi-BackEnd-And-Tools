import type { Middleware, MiddlewareContext } from './types';

/**
 * Rate limit configuration.
 */
export interface RateLimitConfig {
  /** Maximum number of requests */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Key generator function */
  getKey: (context: MiddlewareContext) => string;
}

/**
 * Rate limit store entry.
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Creates a rate limiting middleware.
 * 
 * @param config - Rate limit configuration
 * @returns Rate limit middleware
 */
export function createRateLimitMiddleware(config: RateLimitConfig): Middleware {
  const store = new Map<string, RateLimitEntry>();

  // Cleanup expired entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, config.windowMs);

  return {
    name: 'rateLimit',
    config: {
      enabled: true,
      order: 0, // Execute first
    },
    execute: async (context: MiddlewareContext, next: () => Promise<void>): Promise<void> => {
      const key = config.getKey(context);
      const now = Date.now();
      let entry = store.get(key);

      if (!entry || now > entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + config.windowMs,
        };
        store.set(key, entry);
      }

      entry.count++;

      if (entry.count > config.maxRequests) {
        const error = new Error(
          `Rate limit exceeded. Maximum ${config.maxRequests} requests per ${config.windowMs}ms.`
        );
        context.error = error;
        throw error;
      }

      if (context.response) {
        context.response.metadata = {
          ...context.response.metadata,
          rateLimit: {
            remaining: Math.max(0, config.maxRequests - entry.count),
            resetTime: entry.resetTime,
          },
        };
      }

      await next();
    },
  };
}
