/**
 * Middleware context passed through the middleware chain.
 */
export interface MiddlewareContext {
  /** Request metadata */
  request: {
    /** Request identifier */
    id: string;
    /** Request timestamp */
    timestamp: number;
    /** Request path or identifier */
    path?: string;
    /** Additional request metadata */
    metadata?: Record<string, unknown>;
  };
  /** Response metadata */
  response?: {
    /** Response timestamp */
    timestamp: number;
    /** Response duration in milliseconds */
    duration?: number;
    /** Additional response metadata */
    metadata?: Record<string, unknown>;
  };
  /** Error if request failed */
  error?: unknown;
  /** Additional context data */
  [key: string]: unknown;
}

/**
 * Middleware function type.
 */
export type MiddlewareFunction = (
  context: MiddlewareContext,
  next: () => Promise<void>
) => Promise<void>;

/**
 * Middleware configuration.
 */
export interface MiddlewareConfig {
  /** Whether middleware is enabled */
  enabled: boolean;
  /** Execution order (lower numbers execute first) */
  order?: number;
  /** Additional middleware-specific configuration */
  [key: string]: unknown;
}

/**
 * Middleware definition.
 */
export interface Middleware {
  /** Middleware name */
  name: string;
  /** Middleware function */
  execute: MiddlewareFunction;
  /** Middleware configuration */
  config: MiddlewareConfig;
}

/**
 * Request interceptor function type.
 */
export type RequestInterceptor<T = unknown> = (request: T) => T | Promise<T>;

/**
 * Response interceptor function type.
 */
export type ResponseInterceptor<T = unknown> = (response: T) => T | Promise<T>;

/**
 * Error interceptor function type.
 */
export type ErrorInterceptor = (error: unknown) => unknown | Promise<unknown>;
