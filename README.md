# Polymarket Telegram Bot

A comprehensive Telegram bot for trading on Polymarket, the world's largest prediction market platform. This bot allows users to browse markets, place orders, manage positions, and handle deposits/withdrawals directly through Telegram.

## Features

### 🏪 Market Trading
- Browse market categories and topics
- View detailed market information and order books
- Place buy/sell orders (market and limit orders)
- Real-time market data integration

### 💼 Portfolio Management
- View current positions across all markets
- Track open orders and trading history
- Monitor portfolio performance

### 💰 Wallet Management
- Automatic proxy wallet creation for each user
- USDC deposit and withdrawal functionality
- Secure private key encryption and storage

### 🔐 Security
- AWS Secrets Manager integration for secure credential storage
- Encrypted private key storage
- Proxy wallet architecture for enhanced security

## Commands

The bot supports the following commands:

- `/start` - Main menu and bot initialization
- `/markets` - Browse available markets
- `/positions` - View your current holdings
- `/openorders` - Check your open orders
- `/history` - View trading history
- `/profile` - Manage your profile and assets

## Prerequisites

- Node.js 16+ 
- MongoDB database
- Telegram Bot Token
- Polymarket API credentials

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd polymarketbot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
# Telegram Bot Configuration
BOT_TOKEN=your_telegram_bot_token

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# AWS Configuration
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Polymarket Configuration
POLYMARKET_API_KEY=your_polymarket_api_key
POLYMARKET_SECRET=your_polymarket_secret
POLYMARKET_PASSPHRASE=your_polymarket_passphrase

# Optional: External URLs
DOCS=https://docs.polymarket.com
WEBSITE=https://polymarket.com

# Network Configuration
RPC_URL=your_polygon_rpc_url
```

4. Set up AWS Secrets Manager:
   - Create secrets for sensitive API credentials
   - Ensure proper IAM permissions for the application

## Running the Bot

### Development
```bash
npm run ts
```

### Production with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start the bot
pm2 start npm --name polymarketbot -- run ts

# Save PM2 configuration
pm2 save
pm2 startup
```

### Alternative: Compiled JavaScript
```bash
# Compile TypeScript
npx tsc

# Run compiled version
pm2 start dist/index.js --name polymarketbot
```

## Architecture

### Database Schema
- **UserInfo**: Stores user data, wallet information, and encrypted private keys
- Session management for bot interactions

### Key Components
- **Bot Interface**: Telegram bot using Telegraf framework
- **Market Integration**: Polymarket CLOB client for trading
- **Wallet Management**: Proxy wallet creation and management
- **Order Management**: Buy/sell order processing
- **Security**: AWS Secrets Manager and encryption utilities

### File Structure
```
├── actions/           # Bot action handlers
├── commands/          # Bot command definitions
├── event/            # Market browsing functionality
├── init/             # Initialization and wallet setup
├── order/            # Order creation and management
├── schema/           # Database schemas
├── start/            # Welcome and onboarding
├── user/             # User management and profiles
└── utils/            # Utility functions and constants
```

## Security Considerations

- Private keys are encrypted before storage
- AWS Secrets Manager handles sensitive API credentials
- Proxy wallets provide additional security layer
- All user data is stored securely in MongoDB

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Disclaimer

This bot is for educational and personal use. Trading cryptocurrencies and prediction markets involves risk. Use at your own discretion and never trade more than you can afford to lose.

## Support

For issues and questions:
- Create an issue in this repository
- Check the Polymarket documentation for API-related questions

## Roadmap

- [ ] Enhanced order types (stop-loss, take-profit)
- [ ] Advanced charting integration
- [ ] Multi-language support
- [ ] Mobile app integration
- [ ] Social trading features