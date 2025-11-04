import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  PRIVATE_KEY: z.string().optional(),
  NETWORK: z.string().default('alfajores'),
  RPC_URL: z.string().url().optional(),
  DATABASE_PATH: z.string().default('./data/automation.db'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ENABLE_MULTI_CHAIN: z.string().transform(val => val === 'true').default('false'),
  ENABLE_PROXY: z.string().transform(val => val === 'true').default('false'),
  ENABLE_TESTING: z.string().transform(val => val === 'true').default('false'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  API_KEY: z.string().optional(),
  JWT_SECRET: z.string().optional(),
});

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

export const config = loadConfig();

export function getEnvConfig() {
  return {
    development: {
      logLevel: config.LOG_LEVEL || 'debug',
      enableDetailedErrors: true,
    },
    production: {
      logLevel: config.LOG_LEVEL || 'info',
      enableDetailedErrors: false,
    },
    test: {
      logLevel: config.LOG_LEVEL || 'error',
      enableDetailedErrors: true,
    },
  }[config.NODE_ENV] || {};
}