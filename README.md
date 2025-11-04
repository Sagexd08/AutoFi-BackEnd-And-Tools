# 🤖 Celo AI Automation Engine

Advanced AI-powered blockchain automation system with Gemini integration for multi-chain blockchain operations, featuring intelligent agents, dynamic smart contracts, comprehensive rate limiting, and a powerful CLI tool.

## ✨ Features

### Core Capabilities
- 🧠 **AI Decision Engine** - Gemini-powered natural language processing for intelligent automation
- 🔗 **Multi-Chain Support** - Ethereum, Polygon, BSC, Arbitrum, Optimism, Celo, Base, Avalanche, and more
- 💾 **SQLite Database** - Persistent data storage and analytics
- 🛡️ **Security First** - Built-in transaction validation, safety checks, and comprehensive error handling
- 📊 **Analytics & Monitoring** - Comprehensive usage tracking, metrics, and performance insights
- 🚀 **Express API** - RESTful endpoints with advanced rate limiting and middleware

### Advanced Features
- 🔐 **Rate Limiting** - Multi-tier rate limiting system (standard, strict, transaction, agent, auth)
- 📦 **SDK Package** - Production-ready TypeScript SDK with comprehensive error handling
- 🛠️ **CLI Tool** - Command-line interface for all SDK operations
- 🔄 **Retry Mechanisms** - Exponential backoff with circuit breaker patterns
- 💾 **Caching System** - Memory and LRU cache implementations
- 🔌 **Plugin System** - Extensible plugin architecture with lifecycle hooks
- 📈 **Observability** - Structured logging, metrics collection, and health checks
- ✅ **Zod Validation** - Runtime schema validation for all configurations

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "Build on Celo"

# Install dependencies
npm install

# Install SDK dependencies
cd Backend/sdk
npm install
npm run build
```

### Basic Usage

#### Using the Automation System

```javascript
import { CombinedAutomationSystem } from './Backend/services/automation-system.js';

const automation = new CombinedAutomationSystem({
  geminiApiKey: 'your-gemini-api-key',
  network: 'alfajores',
  enableMultiChain: true,
});

// Process natural language
const result = await automation.processNaturalLanguage(
  'Send 100 cUSD to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb'
);

console.log(result);
```

#### Using the SDK

```typescript
import { CeloAISDK } from '@celo-ai/sdk';

const sdk = new CeloAISDK({
  apiKey: 'your-api-key',
  privateKey: 'your-private-key',
  network: 'ethereum',
  enableMultiChain: true,
});

await sdk.initialize();

// Create an AI agent
const agentId = await sdk.createAgent({
  type: 'treasury',
  name: 'Treasury Manager',
  capabilities: ['analyze_portfolio', 'rebalance'],
});

// Process with agent
const response = await sdk.processWithAgent(agentId, 'Analyze my portfolio');
```

#### Using the CLI Tool

```bash
# Install globally
npm install -g @celo-ai/sdk

# Initialize configuration
celo-ai init --api-key YOUR_KEY --network ethereum

# Create an agent
celo-ai agent create \
  --type defi \
  --name "DeFi Optimizer" \
  --capabilities "find_yield,execute_swaps"

# Query an agent
celo-ai agent query agent_123 "Find best yield opportunities"

# Check chain health
celo-ai chain health ethereum

# Send a transaction
celo-ai tx send \
  --to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb \
  --value 1000000000000000000
```

### Start Server

```bash
cd Backend
npm start
```

The API will be available at `http://localhost:3000` with rate limiting enabled.

### API Endpoints

All endpoints are protected with appropriate rate limiting:

- **Chain Management**: `/api/chains` - Standard rate limiting (100 req/15min)
- **Contracts**: `/api/contracts` - Transaction rate limiting (10 req/min)
- **Transactions**: `/api/transactions` - Transaction rate limiting (10 req/min)
- **Agents**: `/api/agents` - Agent rate limiting (20 req/min)
- **Monitoring**: `/api/monitoring` - Standard rate limiting
- **Health**: `/api/health` - No rate limiting

See [API Documentation](./Backend/routes/api-routes.js) for complete endpoint list.

## 📚 Documentation

- [SDK Documentation](./Backend/sdk/README.md) - Complete SDK guide
- [CLI Documentation](./Backend/sdk/CLI.md) - CLI tool usage
- [API Routes](./Backend/routes/api-routes.js) - API endpoint reference

## 🏗️ Architecture

### Backend Structure

```
Backend/
├── services/
│   └── automation-system.js    # Main automation system
├── routes/
│   └── api-routes.js           # API routes with rate limiting
├── middleware/
│   ├── rate-limit.js            # Rate limiting middleware
│   └── error-handler.js         # Error handling middleware
├── utils/
│   ├── errors.js                # Error classes
│   └── logger.js                # Structured logging
└── sdk/
    ├── cli/
    │   └── index.js             # CLI tool
    └── src/
        ├── errors/              # SDK error classes
        ├── middleware/          # Middleware system
        ├── cache/               # Caching layer
        ├── observability/       # Logging & metrics
        └── plugins/             # Plugin system
```

### SDK Features

- **Error Handling**: Custom error classes with recovery strategies
- **Validation**: Zod schema validation for type safety
- **Retry Logic**: Exponential backoff with circuit breaker
- **Caching**: Memory and LRU cache implementations
- **Middleware**: Extensible middleware chain
- **Plugins**: Plugin architecture for extensibility
- **Observability**: Structured logging and metrics

## 🔒 Rate Limiting

The API implements a multi-tier rate limiting system:

- **Standard Rate Limiter**: 100 requests per 15 minutes
  - Used for general queries, monitoring, chain info

- **Strict Rate Limiter**: 10 requests per 15 minutes
  - Used for sensitive operations, test execution

- **Transaction Rate Limiter**: 10 requests per 1 minute
  - Used for transaction operations, deployments

- **Agent Rate Limiter**: 20 requests per 1 minute
  - Used for AI agent operations

- **Auth Rate Limiter**: 5 requests per 15 minutes
  - Used for authentication endpoints

## 🧪 Testing

```bash
# Run tests
npm test

# Run SDK tests
cd Backend/sdk
npm test

# Run with coverage
npm run test:coverage
```

## 📦 SDK Package

### Installation

```bash
npm install @celo-ai/sdk
```

### Usage

```typescript
import { CeloAISDK } from '@celo-ai/sdk';

const sdk = new CeloAISDK(config);
await sdk.initialize();

// Use SDK methods...
```

### CLI Tool

```bash
# Install globally
npm install -g @celo-ai/sdk

# Use CLI
celo-ai --help
celo-ai init
celo-ai chain list
celo-ai agent create --type treasury --name "My Agent"
```

## 🛠️ Development

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Install SDK dependencies
cd Backend/sdk
npm install

# Build SDK
npm run build

# Link CLI (for development)
npm link
```

### Environment Variables

Create a `.env` file in the Backend directory:

```env
GEMINI_API_KEY=your-gemini-api-key
POSTMAN_API_KEY=your-postman-api-key
PRIVATE_KEY=your-private-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 📊 Monitoring

The system includes comprehensive monitoring:

- **Health Checks**: `/api/health` - System health status
- **Metrics**: `/api/monitoring/system` - System metrics
- **Performance**: `/api/monitoring/performance` - Performance data
- **Logs**: `/api/monitoring/logs` - Application logs
- **Alerts**: `/api/monitoring/alerts` - System alerts

## 🔐 Security

- ✅ Rate limiting on all endpoints
- ✅ Input validation with Zod schemas
- ✅ Error handling with custom error classes
- ✅ Transaction validation and safety checks
- ✅ Security headers with Helmet
- ✅ CORS configuration
- ✅ Request logging and monitoring

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see LICENSE file for details

## 🚀 Roadmap

- [ ] Enhanced AI agent capabilities
- [ ] Additional blockchain networks
- [ ] WebSocket support for real-time updates
- [ ] Advanced analytics dashboard
- [ ] Mobile SDK
- [ ] GraphQL API

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [Full Documentation](./Backend/sdk/README.md)

---

Built with ❤️ for the Celo ecosystem and multi-chain blockchain automation.