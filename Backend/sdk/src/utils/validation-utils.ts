import { z } from 'zod';
import { ValidationError } from '../errors';
import {
  SDKConfigSchema,
  ChainConfigSchema,
  AgentConfigSchema,
  ContractConfigSchema,
  TransactionRequestSchema,
  AddressSchema,
  NumberStringSchema,
  NonNegativeNumberStringSchema,
} from '../schemas';

/**
 * Validation utilities using Zod schemas.
 * Provides type-safe validation with detailed error messages.
 */
export class ValidationUtils {
  /**
   * Validates an Ethereum address.
   * 
   * @param address - Address to validate
   * @throws ValidationError if address is invalid
   */
  validateAddress(address: string): void {
    try {
      AddressSchema.parse(address);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors[0]?.message ?? 'Invalid address',
          {
            field: 'address',
            value: address,
            reason: error.errors[0]?.message,
            cause: error as Error,
          }
        );
      }
      throw error;
    }
  }

  /**
   * Validates a transaction request.
   * 
   * @param request - Transaction request to validate
   * @throws ValidationError if request is invalid
   */
  validateTransactionRequest(request: unknown): void {
    try {
      TransactionRequestSchema.parse(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError?.message ?? 'Invalid transaction request',
          {
            field: firstError?.path.join('.'),
            value: request,
            reason: firstError?.message,
            cause: error as Error,
          }
        );
      }
      throw error;
    }
  }

  /**
   * Validates an agent configuration.
   * 
   * @param config - Agent config to validate
   * @throws ValidationError if config is invalid
   */
  validateAgentConfig(config: unknown): void {
    try {
      AgentConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError?.message ?? 'Invalid agent config',
          {
            field: firstError?.path.join('.'),
            value: config,
            reason: firstError?.message,
            cause: error as Error,
          }
        );
      }
      throw error;
    }
  }

  /**
   * Validates a contract configuration.
   * 
   * @param config - Contract config to validate
   * @throws ValidationError if config is invalid
   */
  validateContractConfig(config: unknown): void {
    try {
      ContractConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError?.message ?? 'Invalid contract config',
          {
            field: firstError?.path.join('.'),
            value: config,
            reason: firstError?.message,
            cause: error as Error,
          }
        );
      }
      throw error;
    }
  }

  /**
   * Validates a private key.
   * 
   * @param privateKey - Private key to validate
   * @throws ValidationError if private key is invalid
   */
  validatePrivateKey(privateKey: string): void {
    try {
      z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid private key format').parse(privateKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors[0]?.message ?? 'Invalid private key',
          {
            field: 'privateKey',
            value: privateKey,
            reason: error.errors[0]?.message,
            cause: error as Error,
          }
        );
      }
      throw error;
    }
  }

  /**
   * Validates a chain ID.
   * 
   * @param chainId - Chain ID to validate
   * @throws ValidationError if chain ID is invalid
   */
  validateChainId(chainId: string | number): void {
    try {
      z.union([
        z.string().transform((val) => parseInt(val, 10)),
        z.number(),
      ]).pipe(z.number().int().positive('Chain ID must be a positive number')).parse(chainId);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors[0]?.message ?? 'Invalid chain ID',
          {
            field: 'chainId',
            value: chainId,
            reason: error.errors[0]?.message,
            cause: error as Error,
          }
        );
      }
      throw error;
    }
  }

  /**
   * Validates an amount string.
   * 
   * @param amount - Amount to validate
   * @throws ValidationError if amount is invalid
   */
  validateAmount(amount: string): void {
    try {
      NonNegativeNumberStringSchema.parse(amount);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors[0]?.message ?? 'Invalid amount',
          {
            field: 'amount',
            value: amount,
            reason: error.errors[0]?.message,
            cause: error as Error,
          }
        );
      }
      throw error;
    }
  }

  /**
   * Validates a gas price string.
   * 
   * @param gasPrice - Gas price to validate
   * @throws ValidationError if gas price is invalid
   */
  validateGasPrice(gasPrice: string): void {
    try {
      NumberStringSchema.pipe(z.string().refine((val) => parseInt(val, 10) > 0, {
        message: 'Gas price must be positive',
      })).parse(gasPrice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors[0]?.message ?? 'Invalid gas price',
          {
            field: 'gasPrice',
            value: gasPrice,
            reason: error.errors[0]?.message,
            cause: error as Error,
          }
        );
      }
      throw error;
    }
  }

  /**
   * Validates a URL string.
   * 
   * @param url - URL to validate
   * @throws ValidationError if URL is invalid
   */
  validateUrl(url: string): void {
    try {
      z.string().url('Invalid URL format').parse(url);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors[0]?.message ?? 'Invalid URL',
          {
            field: 'url',
            value: url,
            reason: error.errors[0]?.message,
            cause: error as Error,
          }
        );
      }
      throw error;
    }
  }

  /**
   * Validates an API key.
   * 
   * @param apiKey - API key to validate
   * @throws ValidationError if API key is invalid
   */
  validateApiKey(apiKey: string): void {
    try {
      z.string().min(10, 'API key must be at least 10 characters long').parse(apiKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors[0]?.message ?? 'Invalid API key',
          {
            field: 'apiKey',
            value: apiKey,
            reason: error.errors[0]?.message,
            cause: error as Error,
          }
        );
      }
      throw error;
    }
  }

  /**
   * Validates SDK configuration.
   * 
   * @param config - SDK config to validate
   * @throws ValidationError if config is invalid
   */
  validateSDKConfig(config: unknown): void {
    try {
      SDKConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError?.message ?? 'Invalid SDK config',
          {
            field: firstError?.path.join('.'),
            value: config,
            reason: firstError?.message,
            cause: error as Error,
          }
        );
      }
      throw error;
    }
  }

  /**
   * Validates chain configuration.
   * 
   * @param config - Chain config to validate
   * @throws ValidationError if config is invalid
   */
  validateChainConfig(config: unknown): void {
    try {
      ChainConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError?.message ?? 'Invalid chain config',
          {
            field: firstError?.path.join('.'),
            value: config,
            reason: firstError?.message,
            cause: error as Error,
          }
        );
      }
      throw error;
    }
  }
}
