export { SDKError } from './base';

export { ChainError } from './chain-error';

export { ValidationError } from './validation-error';

export { ContractError } from './contract-error';

export { AgentError } from './agent-error';

export { TransactionError } from './transaction-error';

import type { SDKError } from './base';

export function isSDKError(error: unknown): error is SDKError {

  return error instanceof Error && 'code' in error && 'context' in error;

}

export function extractErrorInfo(error: unknown): {

  message: string;

  code?: string;

  context?: Record<string, unknown>;

  recoverable?: boolean;

  cause?: Error;

} {

  if (isSDKError(error)) {

    return {

      message: error.message,

      code: error.code,

      context: error.context,

      recoverable: error.recoverable,

      cause: error.cause,

    };

  }

  if (error && typeof error === 'object' && 'message' in error && error instanceof Error) {

    return {

      message: (error as Error).message,

      cause: error as Error,

    };

  }

  return {

    message: String(error),

  };

}

