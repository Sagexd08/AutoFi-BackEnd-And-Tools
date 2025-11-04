#!/usr/bin/env node



import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('celo-ai')
  .description('CLI tool for Celo AI SDK - Multi-chain blockchain automation')
  .version('1.0.0');


async function getSDK() {
  try {
    
    const sdkPath = path.join(__dirname, '../dist/index.js');
    const sdk = await import(sdkPath);
    return sdk.CeloAISDK;
  } catch {
    try {
      
      const { CeloAISDK } = await import('@celo-ai/sdk');
      return CeloAISDK;
    } catch {
      console.error('❌ SDK not found. Please install @celo-ai/sdk first.');
      console.error('   Run: npm install @celo-ai/sdk');
      process.exit(1);
    }
  }
}


async function loadConfig() {
  const configPath = path.join(process.cwd(), '.celo-ai.config.json');
  try {
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch {
    
    return {
      apiKey: process.env.CELO_AI_API_KEY,
      privateKey: process.env.CELO_AI_PRIVATE_KEY,
      network: process.env.CELO_AI_NETWORK || 'ethereum',
      enableMultiChain: true,
      logLevel: 'info',
    };
  }
}


program
  .command('init')
  .description('Initialize SDK configuration')
  .option('-k, --api-key <key>', 'API key')
  .option('-p, --private-key <key>', 'Private key')
  .option('-n, --network <network>', 'Network name (default: ethereum)')
  .action(async (options) => {
    try {
      const configPath = path.join(process.cwd(), '.celo-ai.config.json');
      const config = {
        apiKey: options.apiKey || process.env.CELO_AI_API_KEY || '',
        privateKey: options.privateKey || process.env.CELO_AI_PRIVATE_KEY || '',
        network: options.network || 'ethereum',
        enableMultiChain: true,
        logLevel: 'info',
      };

      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      console.log('✅ Configuration file created at:', configPath);
    } catch (error) {
      console.error('❌ Failed to initialize configuration:', error.message);
      process.exit(1);
    }
  });


const chainCmd = program
  .command('chain')
  .description('Chain management commands');

chainCmd
  .command('list')
  .description('List all supported chains')
  .action(async () => {
    try {
      const config = await loadConfig();
      const CeloAISDK = await getSDK();
      const sdk = new CeloAISDK(config);
      await sdk.initialize();
      
      const chains = await sdk.getSupportedChains();
      console.log('\n📋 Supported Chains:');
      console.table(chains.map(chain => ({
        ID: chain.id,
        Name: chain.name,
        ChainID: chain.chainId,
        Testnet: chain.isTestnet ? 'Yes' : 'No',
      })));
    } catch (error) {
      console.error('❌ Failed to list chains:', error.message);
      process.exit(1);
    }
  });

chainCmd
  .command('health [chainId]')
  .description('Check chain health')
  .action(async (chainId) => {
    try {
      const config = await loadConfig();
      const CeloAISDK = await getSDK();
      const sdk = new CeloAISDK(config);
      await sdk.initialize();

      if (chainId) {
        const healthy = await sdk.getChainHealth(chainId);
        console.log(`\n🔍 Chain "${chainId}": ${healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      } else {
        const health = await sdk.getAllChainHealth();
        console.log('\n🔍 Chain Health Status:');
        console.table(Object.entries(health).map(([id, healthy]) => ({
          Chain: id,
          Status: healthy ? '✅ Healthy' : '❌ Unhealthy',
        })));
      }
    } catch (error) {
      console.error('❌ Failed to check chain health:', error.message);
      process.exit(1);
    }
  });


const agentCmd = program
  .command('agent')
  .description('AI agent management commands');

agentCmd
  .command('create')
  .description('Create a new AI agent')
  .requiredOption('-t, --type <type>', 'Agent type')
  .requiredOption('-n, --name <name>', 'Agent name')
  .option('-d, --description <desc>', 'Agent description')
  .option('-c, --capabilities <caps>', 'Comma-separated capabilities')
  .action(async (options) => {
    try {
      const config = await loadConfig();
      const CeloAISDK = await getSDK();
      const sdk = new CeloAISDK(config);
      await sdk.initialize();
      
      const agentId = await sdk.createAgent({
        type: options.type,
        name: options.name,
        description: options.description || '',
        capabilities: options.capabilities ? options.capabilities.split(',') : [],
      });

      console.log(`\n✅ Agent created successfully!`);
      console.log(`   Agent ID: ${agentId}`);
    } catch (error) {
      console.error('❌ Failed to create agent:', error.message);
      process.exit(1);
    }
  });

agentCmd
  .command('list')
  .description('List all agents')
  .action(async () => {
    try {
      const config = await loadConfig();
      const CeloAISDK = await getSDK();
      const sdk = new CeloAISDK(config);
      await sdk.initialize();

      const agents = await sdk.getAllAgents();
      console.log(`\n📋 Agents (${agents.length}):`);
      if (agents.length === 0) {
        console.log('   No agents found.');
      } else {
        console.table(agents);
      }
    } catch (error) {
      console.error('❌ Failed to list agents:', error.message);
      process.exit(1);
    }
  });

agentCmd
  .command('query <agentId> <query>')
  .description('Query an agent')
  .action(async (agentId, query) => {
    try {
      const config = await loadConfig();
      const CeloAISDK = await getSDK();
      const sdk = new CeloAISDK(config);
      await sdk.initialize();

      console.log(`\n🤖 Querying agent "${agentId}"...`);
      const response = await sdk.processWithAgent(agentId, query);

      console.log('\n📝 Response:');
      console.log(`   Success: ${response.success}`);
      console.log(`   Response: ${response.response}`);
      if (response.reasoning) {
        console.log(`   Reasoning: ${response.reasoning}`);
      }
      console.log(`   Confidence: ${(response.confidence * 100).toFixed(2)}%`);
      console.log(`   Execution Time: ${response.executionTime}ms`);
    } catch (error) {
      console.error('❌ Failed to query agent:', error.message);
      process.exit(1);
    }
  });


const txCmd = program
  .command('tx')
  .description('Transaction commands');

txCmd
  .command('send')
  .description('Send a transaction')
  .requiredOption('-t, --to <address>', 'Recipient address')
  .option('-v, --value <value>', 'Value in wei')
  .option('-d, --data <data>', 'Transaction data')
  .option('-c, --chain <chain>', 'Chain ID')
  .action(async (options) => {
    try {
      const config = await loadConfig();
      const CeloAISDK = await getSDK();
      const sdk = new CeloAISDK(config);
      await sdk.initialize();

      console.log('\n📤 Sending transaction...');
      const response = await sdk.sendTransaction(
        {
          to: options.to,
          value: options.value,
          data: options.data,
        },
        options.chain
      );

      if (response.success) {
        console.log('\n✅ Transaction sent successfully!');
        console.log(`   Transaction Hash: ${response.txHash}`);
        if (response.blockNumber) {
          console.log(`   Block Number: ${response.blockNumber}`);
        }
      } else {
        console.error('\n❌ Transaction failed:', response.error);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Failed to send transaction:', error.message);
      process.exit(1);
    }
  });


const contractCmd = program
  .command('contract')
  .description('Contract management commands');

contractCmd
  .command('deploy')
  .description('Deploy a contract')
  .requiredOption('-n, --name <name>', 'Contract name')
  .requiredOption('-s, --source <file>', 'Source file path')
  .option('-v, --version <version>', 'Contract version (default: 1.0.0)')
  .option('-c, --chain <chain>', 'Chain ID')
  .action(async (options) => {
    try {
      const config = await loadConfig();
      const CeloAISDK = await getSDK();
      const sdk = new CeloAISDK(config);
      await sdk.initialize();

      const source = await fs.readFile(options.source, 'utf-8');
      
      const abi = []; 
      const bytecode = '0x'; 

      console.log('\n📦 Deploying contract...');
      const deployment = await sdk.deployContract(
        {
          name: options.name,
          version: options.version || '1.0.0',
          source,
          abi,
          bytecode,
        },
        options.chain
      );

      if (deployment.success) {
        console.log('\n✅ Contract deployed successfully!');
        console.log(`   Contract Address: ${deployment.contractAddress}`);
        console.log(`   Transaction Hash: ${deployment.txHash}`);
      } else {
        console.error('\n❌ Contract deployment failed:', deployment.error);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Failed to deploy contract:', error.message);
      process.exit(1);
    }
  });


program
  .command('health')
  .description('Check SDK health')
  .action(async () => {
    try {
      const config = await loadConfig();
      const CeloAISDK = await getSDK();
      const sdk = new CeloAISDK(config);
      await sdk.initialize();

      const health = await sdk.healthCheck();
      console.log('\n🏥 SDK Health Status:');
      console.log(`   Overall: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      console.log('\n   Services:');
      for (const [service, status] of Object.entries(health.services)) {
        console.log(`     ${service}: ${status ? '✅' : '❌'}`);
      }
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      process.exit(1);
    }
  });


program.parse(process.argv);
