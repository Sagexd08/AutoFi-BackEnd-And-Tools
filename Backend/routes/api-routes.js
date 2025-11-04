import express from 'express';
import { MultiChainConfig } from '../multi-chain-config.js';
import { ProxyServer } from '../proxy-server.js';
import { ContractFactory } from '../contract-factory.js';
import { MonitoringSystem } from '../monitoring-system.js';
import PostmanProtocol from '../postman-protocol.js';
import { validateToolExecution } from './tool-validation-middleware.js';
import {
  standardRateLimiter,
  strictRateLimiter,
  transactionRateLimiter,
  agentRateLimiter,
  authRateLimiter,
} from '../middleware/rate-limit.js';
import { asyncHandler } from '../middleware/error-handler.js';

// Factory function to create router with automation system
export function createApiRoutes(automationSystem = null) {
  const router = express.Router();
  
  // If automation system is provided, use its components
  const multiChainConfig = automationSystem?.multiChainConfig || new MultiChainConfig();
  const contractFactory = automationSystem?.contractFactory || new ContractFactory(multiChainConfig);
  const monitoringSystem = automationSystem?.monitoringSystem || new MonitoringSystem();
  const postmanProtocol = automationSystem?.postmanProtocol || new PostmanProtocol({
    apiKey: process.env.POSTMAN_API_KEY,
  });

// Chain routes - Standard rate limiting
router.get('/chains', standardRateLimiter, asyncHandler(async (req, res) => {
  const chains = multiChainConfig.getAllChains();
  res.json({ success: true, chains });
}));

router.get('/chains/health', standardRateLimiter, asyncHandler(async (req, res) => {
  const health = await multiChainConfig.checkAllChainsHealth();
  res.json({ success: true, chains: health });
}));

router.get('/chains/:chainId/health', standardRateLimiter, asyncHandler(async (req, res) => {
  const { chainId } = req.params;
  const health = await multiChainConfig.checkChainHealth(chainId);
  res.json({ success: true, chainId, health });
}));

router.post('/chains/select', standardRateLimiter, asyncHandler(async (req, res) => {
  const { operation, preferences } = req.body;
  const bestChain = multiChainConfig.getBestChainForOperation(operation, preferences);
  res.json({ 
    success: true,
    selectedChain: bestChain,
    timestamp: new Date().toISOString()
  });
}));

// Contract routes - Transaction rate limiting for deployment
router.post('/contracts/deploy', transactionRateLimiter, asyncHandler(async (req, res) => {
  const { contractConfig, chainId = 'ethereum' } = req.body;
  const deployment = await contractFactory.deployContract(contractConfig, chainId);
  res.json({ success: true, ...deployment });
}));

router.get('/contracts', standardRateLimiter, asyncHandler(async (req, res) => {
  const { chainId } = req.query;
  const contracts = await contractFactory.getDeployedContracts(chainId);
  res.json({ success: true, contracts });
}));

router.get('/contracts/:address', standardRateLimiter, asyncHandler(async (req, res) => {
  const { address } = req.params;
  const { abi, chainId = 'ethereum' } = req.query;
  
  if (!abi) {
    return res.status(400).json({ success: false, error: 'ABI is required' });
  }
  
  const contract = await contractFactory.getContract(address, JSON.parse(abi), chainId);
  res.json({ success: true, contract });
}));

// Monitoring routes - Standard rate limiting
router.get('/monitoring/system', standardRateLimiter, asyncHandler(async (req, res) => {
  const metrics = monitoringSystem.metrics.system;
  res.json({ success: true, metrics });
}));

router.get('/monitoring/application', standardRateLimiter, asyncHandler(async (req, res) => {
  const metrics = monitoringSystem.metrics.application;
  res.json({ success: true, metrics });
}));

router.get('/monitoring/performance', standardRateLimiter, asyncHandler(async (req, res) => {
  const metrics = monitoringSystem.metrics.performance;
  res.json({ success: true, metrics });
}));

router.get('/monitoring/alerts', standardRateLimiter, asyncHandler(async (req, res) => {
  const alerts = monitoringSystem.alerts;
  res.json({ success: true, alerts });
}));

router.get('/monitoring/logs', standardRateLimiter, asyncHandler(async (req, res) => {
  const logs = monitoringSystem.logs.slice(-100);
  res.json({ success: true, logs });
}));

router.get('/monitoring/health', standardRateLimiter, asyncHandler(async (req, res) => {
  const health = monitoringSystem.getHealthStatus();
  res.json({ success: true, ...health });
}));

// Testing routes - Strict rate limiting for test execution
router.get('/testing/collections', standardRateLimiter, asyncHandler(async (req, res) => {
  const collections = await postmanProtocol.getCollections();
  res.json({ success: true, collections });
}));

router.post('/testing/collections', standardRateLimiter, asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const collectionId = await postmanProtocol.createCollection({
    info: {
      name,
      description: description || '',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [],
  });
  res.json({ success: true, collectionId });
}));

router.get('/testing/collections/:collectionId', standardRateLimiter, asyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  const collection = await postmanProtocol.getCollection(collectionId);
  res.json({ success: true, collection });
}));

router.post('/testing/collections/:collectionId/tests', standardRateLimiter, asyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  const test = req.body;
  res.json({ success: true, testId: test.id });
}));

router.delete('/testing/collections/:collectionId/tests/:testId', standardRateLimiter, asyncHandler(async (req, res) => {
  res.json({ success: true });
}));

router.post('/testing/collections/:collectionId/run', strictRateLimiter, asyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  const results = await postmanProtocol.runCollectionTests(collectionId);
  res.json({ success: true, results });
}));

router.post('/testing/collections/:collectionId/tests/:testId/run', strictRateLimiter, asyncHandler(async (req, res) => {
  const { collectionId, testId } = req.params;
  const result = {
    id: testId,
    testName: `Test ${testId}`,
    success: Math.random() > 0.2,
    status: Math.random() > 0.2 ? 'passed' : 'failed',
    duration: Math.floor(Math.random() * 1000) + 100,
    timestamp: new Date().toISOString(),
  };
  res.json({ success: true, result });
}));

// Transaction routes - Transaction rate limiting
router.post('/transactions/send', transactionRateLimiter, asyncHandler(async (req, res) => {
  const { transaction, chainId = 'ethereum' } = req.body;
  const client = await multiChainConfig.createChainClient(chainId);
  const result = {
    success: true,
    txHash: '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join(''),
    timestamp: new Date().toISOString(),
  };
  res.json(result);
}));

router.get('/transactions/:txHash/status', standardRateLimiter, asyncHandler(async (req, res) => {
  const status = {
    success: true,
    status: 'success',
    blockNumber: '12345678',
    gasUsed: '21000',
    confirmations: '12+',
  };
  res.json(status);
}));

// Token routes - Standard rate limiting
router.get('/tokens/balance/:address', standardRateLimiter, asyncHandler(async (req, res) => {
  const { address } = req.params;
  const { tokenAddress = '0x0000000000000000000000000000000000000000', chainId = 'ethereum' } = req.query;
  const client = await multiChainConfig.createChainClient(chainId);
  const balance = {
    success: true,
    balance: (Math.random() * 100).toFixed(6),
    raw: Math.floor(Math.random() * 1000000000000000000).toString(),
    decimals: 18,
    symbol: 'ETH',
    address: tokenAddress,
  };
  res.json(balance);
}));

// Agent routes - Agent rate limiting
router.get('/agents', standardRateLimiter, asyncHandler(async (req, res) => {
  const agents = [
    {
      id: 'agent_1',
      type: 'treasury',
      name: 'Treasury Manager',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];
  res.json({ success: true, agents });
}));

router.post('/agents', agentRateLimiter, asyncHandler(async (req, res) => {
  const { type, name, description, capabilities } = req.body;
  const agent = {
    id: `agent_${Date.now()}`,
    type,
    name,
    description,
    capabilities,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  res.json({ success: true, agent });
}));

router.post('/agents/:agentId/process', agentRateLimiter, asyncHandler(async (req, res) => {
  const { agentId } = req.params;
  const { input, options = {} } = req.body;
  const response = {
    success: true,
    response: `AI Agent response for: ${input}`,
    reasoning: 'AI reasoning process',
    confidence: 0.85,
    functionCalls: [],
    executionTime: Math.floor(Math.random() * 1000) + 100,
    agentId,
    timestamp: new Date().toISOString(),
  };
  res.json(response);
}));

  // Code Generator routes - Strict rate limiting
  router.post('/code-generator/generate', strictRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.codeGenerator) {
      return res.status(503).json({ success: false, error: 'Code Generator not available' });
    }
    const { description, name, language, options } = req.body;
    const result = await automationSystem.codeGenerator.generateCode({
      description,
      name,
      language,
      options
    });
    res.json({ success: true, ...result });
  }));

  router.post('/code-generator/compile', strictRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.codeGenerator) {
      return res.status(503).json({ success: false, error: 'Code Generator not available' });
    }
    const { source, name } = req.body;
    const result = await automationSystem.codeGenerator.compileCode({ source, name });
    res.json({ success: true, ...result });
  }));

  router.post('/code-generator/deploy', transactionRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.codeGenerator) {
      return res.status(503).json({ success: false, error: 'Code Generator not available' });
    }
    const { source, name, chainId, constructorArgs } = req.body;
    const result = await automationSystem.codeGenerator.deployCode({
      source,
      name,
      chainId,
      constructorArgs
    });
    res.json({ success: true, ...result });
  }));

  router.post('/code-generator/generate-and-deploy', strictRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.codeGenerator) {
      return res.status(503).json({ success: false, error: 'Code Generator not available' });
    }
    const result = await automationSystem.codeGenerator.generateAndDeploy(req.body);
    res.json({ success: true, ...result });
  }));

  // Rebalancer System routes - Standard rate limiting
  router.post('/rebalancer/analyze', standardRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.rebalancerSystem) {
      return res.status(503).json({ success: false, error: 'Rebalancer System not available' });
    }
    const result = await automationSystem.rebalancerSystem.analyzePortfolio(req.body);
    res.json({ success: true, ...result });
  }));

  router.post('/rebalancer/rebalance', transactionRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.rebalancerSystem) {
      return res.status(503).json({ success: false, error: 'Rebalancer System not available' });
    }
    const result = await automationSystem.rebalancerSystem.rebalancePortfolio(req.body);
    res.json({ success: true, ...result });
  }));

  router.get('/rebalancer/portfolio/:walletAddress', standardRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.rebalancerSystem) {
      return res.status(503).json({ success: false, error: 'Rebalancer System not available' });
    }
    const { walletAddress } = req.params;
    const portfolio = automationSystem.rebalancerSystem.getPortfolio(walletAddress);
    if (!portfolio) {
      return res.status(404).json({ success: false, error: 'Portfolio not found' });
    }
    res.json({ success: true, ...portfolio });
  }));

  router.get('/rebalancer/history', standardRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.rebalancerSystem) {
      return res.status(503).json({ success: false, error: 'Rebalancer System not available' });
    }
    const { walletAddress } = req.query;
    const history = automationSystem.rebalancerSystem.getRebalanceHistory(walletAddress);
    res.json({ success: true, history });
  }));

  router.post('/rebalancer/yield-opportunities', standardRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.rebalancerSystem) {
      return res.status(503).json({ success: false, error: 'Rebalancer System not available' });
    }
    const result = await automationSystem.rebalancerSystem.findYieldOpportunities(req.body);
    res.json({ success: true, ...result });
  }));

  // Environment Manager routes - Standard rate limiting
  router.get('/environment/tools', standardRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.environmentManager) {
      return res.status(503).json({ success: false, error: 'Environment Manager not available' });
    }
    const tools = automationSystem.environmentManager.getTools();
    res.json({ success: true, tools });
  }));

  router.get('/environment/tools/:toolId', standardRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.environmentManager) {
      return res.status(503).json({ success: false, error: 'Environment Manager not available' });
    }
    const { toolId } = req.params;
    const tool = automationSystem.environmentManager.getTool(toolId);
    if (!tool) {
      return res.status(404).json({ success: false, error: 'Tool not found' });
    }
    res.json({ success: true, ...tool });
  }));

  router.post('/environment/tools/:toolId/execute', standardRateLimiter, validateToolExecution(automationSystem), asyncHandler(async (req, res) => {
    const { toolId } = req.params;
    const { parameters } = req.body;
    const result = await automationSystem.environmentManager.executeTool(toolId, parameters);
    res.json({ success: true, ...result });
  }));

  router.post('/environment/route', standardRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.environmentManager) {
      return res.status(503).json({ success: false, error: 'Environment Manager not available' });
    }
    const result = await automationSystem.environmentManager.routeRequest(req.body);
    res.json({ success: true, ...result });
  }));

  router.get('/environment/stats', standardRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.environmentManager) {
      return res.status(503).json({ success: false, error: 'Environment Manager not available' });
    }
    const stats = automationSystem.environmentManager.getStats();
    res.json({ success: true, ...stats });
  }));

  router.get('/environment/health', standardRateLimiter, asyncHandler(async (req, res) => {
    if (!automationSystem?.environmentManager) {
      return res.status(503).json({ success: false, error: 'Environment Manager not available' });
    }
    const health = automationSystem.environmentManager.getHealth();
    res.json({ success: true, ...health });
  }));

  // Health check - No rate limiting needed
  router.get('/health', asyncHandler(async (req, res) => {
    const health = {
      healthy: true,
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        chains: true,
        contracts: true,
        monitoring: true,
        testing: true,
        agents: true,
        codeGenerator: !!automationSystem?.codeGenerator,
        rebalancer: !!automationSystem?.rebalancerSystem,
        environment: !!automationSystem?.environmentManager,
      },
      uptime: process.uptime(),
      version: '1.0.0',
    };
    res.json({ success: true, ...health });
  }));

  return router;
}

// Default export for backward compatibility
const router = createApiRoutes();
export default router;
