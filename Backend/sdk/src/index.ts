/**
 * Celo AI SDK - Multi-chain blockchain automation with AI agents
 * 
 * @packageDocumentation
 */

// Core SDK exports
export { CeloAISDK } from './core/sdk';
export { MultiChainManager } from './chains/multi-chain-manager';
export { ChainRouter } from './chains/chain-router';
export { LoadBalancer } from './proxy/load-balancer';
export { ProxyServer } from './proxy/proxy-server';
export { ContractFactory } from './contracts/contract-factory';
export { DynamicContractManager } from './contracts/dynamic-contract-manager';
export { PostmanProtocol } from './testing/postman-protocol';
export { APITestSuite } from './testing/api-test-suite';

// Agent system exports
export { AIAgentSystem } from './agents/ai-agent-system';
export { AgentOrchestrator } from './agents/agent-orchestrator';
export type { AgentType } from './agents/agent-types';

// Error handling exports
export {
  SDKError,
  ChainError,
  ValidationError,
  ContractError,
  AgentError,
  TransactionError,
  isSDKError,
  extractErrorInfo,
} from './errors';

// Type exports
export type {
  SDKConfig,
  ChainConfig,
  AgentConfig,
  ContractConfig,
  ProxyConfig,
  TestConfig,
} from './types/config';

export type {
  TransactionRequest,
  TransactionResponse,
  TokenBalance,
  ContractDeployment,
  AgentResponse,
  TestResult,
} from './types/core';

export type {
  ChainInfo,
  NetworkStatus,
  LoadBalancerConfig,
  HealthCheck,
} from './types/network';

export type {
  AgentCapability,
  AgentContext,
  AgentPerformance,
} from './types/agents';

// Utility exports
export { ChainUtils } from './utils/chain-utils';
export { GasUtils } from './utils/gas-utils';
export { ValidationUtils } from './utils/validation-utils';
export { ErrorHandler } from './utils/error-handler';
export { retryWithBackoff, createRetryFunction, CircuitBreaker } from './utils/retry';

// Middleware exports
export {
  MiddlewareChain,
  createLoggingMiddleware,
  createCacheMiddleware,
  createRetryMiddleware,
  createRateLimitMiddleware,
} from './middleware';
export type {
  Middleware,
  MiddlewareContext,
  MiddlewareFunction,
  MiddlewareConfig,
} from './middleware';

// Cache exports
export { MemoryCache, LRUCache } from './cache';
export type { CacheInterface, CacheStats } from './cache';

// Observability exports
export { StructuredLogger, LogLevel } from './observability';
export { InMemoryMetricsCollector, MetricType } from './observability';
export type { Logger, MetricsCollector } from './observability';

// Plugin system exports
export { DefaultPluginRegistry } from './plugins';
export type { Plugin, PluginRegistry, PluginLifecycle } from './plugins';

// Schema exports
export {
  SDKConfigSchema,
  ChainConfigSchema,
  AgentConfigSchema,
  ContractConfigSchema,
  TransactionRequestSchema,
  AddressSchema,
  TransactionHashSchema,
  HexStringSchema,
  NumberStringSchema,
  NonNegativeNumberStringSchema,
} from './schemas';

// Constants
export { SUPPORTED_CHAINS } from './constants/chains';
export { AGENT_TYPES } from './constants/agents';
export { ERROR_CODES, ERROR_MESSAGES } from './constants/errors';

// Version
export const VERSION = '1.0.0';
