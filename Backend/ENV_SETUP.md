# Environment Configuration Guide

This document explains how to configure your environment variables for the Celo Automator project.

## Quick Start

1. Copy the example file:
   ```bash
   cp Backend/env.example Backend/.env
   ```

2. Fill in your actual values in `Backend/.env`

3. The `.env` file is automatically gitignored and will not be committed to the repository

## Environment Variables Reference

### Required Variables

These variables are **required** for the application to function:

- `GEMINI_API_KEY` - Google Gemini API key for AI features
- `PRIVATE_KEY` - Your wallet private key (keep secure!)
- `RPC_URL` - Celo RPC endpoint URL

### Optional Variables

All other variables are optional and have default values. See `Backend/env.example` for complete documentation.

## Variable Categories

### Server Configuration
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production/test)
- `ALLOWED_ORIGINS` - CORS allowed origins

### AI Configuration
- `GEMINI_API_KEY` - Google Gemini API key
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `ANTHROPIC_API_KEY` - Anthropic Claude API key (optional)
- `LANGCHAIN_API_KEY` - LangChain tracing API key
- `LANGSMITH_API_KEY` - LangSmith API key

### Blockchain Configuration
- `PRIVATE_KEY` - Wallet private key
- `NETWORK` - Network name (alfajores/mainnet)
- `RPC_URL` - RPC endpoint URL
- `CELO_RPC_URL` - Celo RPC URL
- `SEPOLIA_RPC_URL` - Ethereum Sepolia RPC URL

### API Keys
- `ALCHEMY_API_KEY` - Alchemy API key
- `ETHERSCAN_API_KEY` - Etherscan API key
- `CELOSCAN_API_KEY` - Celoscan API key
- `POSTMAN_API_KEY` - Postman API key
- `INFURA_API_KEY` - Infura API key

### Feature Flags
- `ENABLE_BLOCKCHAIN_INTEGRATION` - Enable blockchain features
- `ENABLE_AI_AGENTS` - Enable AI agent features
- `ENABLE_MULTI_CHAIN` - Enable multi-chain support
- `ENABLE_MCP` - Enable MCP features
- And more...

## Security Notes

⚠️ **IMPORTANT**: Never commit your `.env` file to version control!

- The `.env` file is automatically gitignored
- Use `.env.example` as a template
- Keep your private keys secure
- Rotate API keys regularly
- Use different keys for development and production

## Loading Environment Variables

The application automatically loads environment variables from:
1. System environment variables
2. `.env` file in the Backend directory
3. Configuration passed to constructors

Variables are loaded using `process.env.VARIABLE_NAME` throughout the codebase.

## Verification

To verify your environment is configured correctly:

1. Check that required variables are set:
   ```bash
   node -e "console.log(process.env.GEMINI_API_KEY ? '✓ GEMINI_API_KEY set' : '✗ GEMINI_API_KEY missing')"
   ```

2. Run the application and check for missing variable warnings

3. Review logs for any "Missing environment variable" warnings

## Troubleshooting

### Variables not loading?
- Ensure `.env` file is in the `Backend/` directory
- Check file name is exactly `.env` (not `.env.txt` or `.env.example`)
- Restart your application after changing `.env`

### Getting "undefined" values?
- Verify variable names match exactly (case-sensitive)
- Check for typos in variable names
- Ensure no extra spaces in `.env` file

### Security concerns?
- Review `.gitignore` to ensure `.env` is ignored
- Never share your `.env` file
- Use environment-specific API keys

