# Celo AI SDK CLI

Command-line interface for the Celo AI SDK - Multi-chain blockchain automation with AI agents.

## Installation

### Global Installation

```bash
npm install -g @celo-ai/sdk
```

### Local Installation

```bash
npm install @celo-ai/sdk
npx celo-ai --help
```

### Development Installation

```bash
cd Backend/sdk
npm install
npm link  # Makes CLI available globally
```

## Quick Start

1. **Initialize Configuration**

```bash
celo-ai init --api-key YOUR_API_KEY --network ethereum
```

This creates a `.celo-ai.config.json` file in your current directory.

2. **Check SDK Health**

```bash
celo-ai health
```

3. **List Supported Chains**

```bash
celo-ai chain list
```

4. **Check Chain Health**

```bash
celo-ai chain health ethereum
```

## Commands

### Chain Management

```bash
# List all supported chains
celo-ai chain list

# Check health of all chains
celo-ai chain health

# Check health of a specific chain
celo-ai chain health ethereum
```

### Agent Management

```bash
# Create a new agent
celo-ai agent create \
  --type treasury \
  --name "My Treasury Agent" \
  --description "Manages portfolio allocation" \
  --capabilities "analyze,rebalance,risk_assessment"

# List all agents
celo-ai agent list

# Query an agent
celo-ai agent query agent_123 "Analyze my portfolio"
```

### Transaction Management

```bash
# Send a transaction
celo-ai tx send \
  --to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb \
  --value 1000000000000000000 \
  --chain ethereum
```

### Contract Management

```bash
# Deploy a contract
celo-ai contract deploy \
  --name MyContract \
  --source ./contracts/MyContract.sol \
  --version 1.0.0 \
  --chain ethereum
```

### Health Check

```bash
# Check SDK health status
celo-ai health
```

## Configuration

The CLI uses a configuration file (`.celo-ai.config.json`) or environment variables:

### Configuration File

```json
{
  "apiKey": "your-api-key",
  "privateKey": "your-private-key",
  "network": "ethereum",
  "enableMultiChain": true,
  "logLevel": "info"
}
```

### Environment Variables

```bash
export CELO_AI_API_KEY=your-api-key
export CELO_AI_PRIVATE_KEY=your-private-key
export CELO_AI_NETWORK=ethereum
```

## Examples

### Complete Workflow

```bash
# 1. Initialize SDK
celo-ai init --api-key YOUR_KEY --network ethereum

# 2. Check health
celo-ai health

# 3. Create an agent
celo-ai agent create \
  --type defi \
  --name "DeFi Optimizer" \
  --capabilities "find_yield,execute_swaps"

# 4. Query the agent
celo-ai agent query agent_123 "Find best yield opportunities"

# 5. Send a transaction
celo-ai tx send \
  --to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb \
  --value 1000000000000000000
```

## Output Format

All commands output structured JSON data suitable for scripting:

```bash
celo-ai chain list | jq '.chains[0]'
```

## Error Handling

The CLI provides clear error messages:

```bash
celo-ai agent query invalid_id "test"
# Error: Agent not found: invalid_id
```

## Troubleshooting

### CLI Not Found

If `celo-ai` command is not found:

```bash
# For global installation
npm install -g @celo-ai/sdk

# For local development
cd Backend/sdk
npm link
```

### Configuration Issues

Ensure your configuration file is valid JSON:

```bash
cat .celo-ai.config.json | jq .
```

### Network Issues

Check network connectivity:

```bash
celo-ai chain health
```

## Advanced Usage

### Using with Scripts

```bash
#!/bin/bash
AGENT_ID=$(celo-ai agent create --type treasury --name "Script Agent" | jq -r '.agentId')
celo-ai agent query $AGENT_ID "Analyze portfolio"
```

### Chaining Commands

```bash
celo-ai chain list | \
  jq -r '.chains[].id' | \
  xargs -I {} celo-ai chain health {}
```

## See Also

- [SDK Documentation](../README.md)
- [API Reference](../docs/API.md)
- [Examples](../examples/)
