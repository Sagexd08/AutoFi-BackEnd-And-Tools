import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

/**
 * Configuration schema using Zod.
 */
const ConfigSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  
  // API Keys
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  PRIVATE_KEY: z.string().optional(),
  
  // Blockchain configuration
  NETWORK: z.string().default('alfajores'),
  RPC_URL: z.string().url().optional(),
  
  // Database configuration
  DATABASE_PATH: z.string().default('./data/automation.db'),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Feature flags
  ENABLE_MULTI_CHAIN: z.string().transform(val => val === 'true').default('false'),
  ENABLE_PROXY: z.string().transform(val => val === 'true').default('false'),
  ENABLE_TESTING: z.string().transform(val => val === 'true').default('false'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Security
  API_KEY: z.string().optional(),
  JWT_SECRET: z.string().optional(),
});

/**
 * Validates and loads configuration from environment variables.
 */
function loadConfig() {
  try {
    const config = ConfigSchema.parse(process.env);
    return {
      ...config,
      isDevelopment: config.NODE_ENV === 'development',
      isProduction: config.NODE_ENV === 'production',
      isTest: config.NODE_ENV === 'test',
    };
  } catch (error) {
    if (error.name === 'ZodError') {
      console.error('Configuration validation failed:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Application configuration.
 */
export const config = loadConfig();

/**
 * Gets environment-specific configuration.
 */
export function getEnvConfig() {
  return {
    development: {
      logLevel: 'debug',
      enableDetailedErrors: true,
    },
    production: {
      logLevel: 'info',
      enableDetailedErrors: false,
    },
    test: {
      logLevel: 'error',
      enableDetailedErrors: true,
    },
  }[config.NODE_ENV] || {};
}
