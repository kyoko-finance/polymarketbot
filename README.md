# Polymarket Telegram 机器人

一个用于在 Polymarket 进行交易的 Telegram 机器人。用户可以直接在 Telegram 中初始化账号、浏览市场、下单、管理持仓，以及进行充值/提现。

## 功能特性

### 🏪 市场交易
- 浏览市场分类与主题
- 查看市场详情与订单簿
- 下达买/卖单（市价单与限价单）
- 实时市场数据对接

### 💼 投资组合管理
- 查看在所有市场的当前持仓
- 跟踪未成交订单与交易历史

### 💰 钱包管理
- 为每位用户自动创建代理钱包（Proxy Wallet）
- 支持 USDC 充值与提现
- 私钥加密存储，安全可靠

### 🔐 安全性
- 集成 AWS Secrets Manager 安全管理凭证
- 私钥加密存储
- 如果要提高安全等级，可以通过单独的签名机管理

## 指令说明

机器人支持以下命令：

- `/start` - 进入主菜单并初始化机器人
- `/markets` - 浏览可用市场
- `/positions` - 查看当前持仓
- `/openorders` - 查看未成交订单
- `/history` - 查看交易历史
- `/profile` - 管理个人资料与资产

## 前置条件

- Node.js 16+ 
- MongoDB 数据库
- Telegram Bot Token（机器人令牌）
- Polymarket API 凭证

## 安装与配置

1. 克隆仓库：
```bash
git clone <repository-url>
cd polymarketbot
```

2. 安装依赖：
```bash
npm install
```

3. 新建 `.env` 文件并填写以下变量：
```env
# Telegram 机器人配置
BOT_TOKEN=your_telegram_bot_token

# 数据库配置
MONGODB_URI=your_mongodb_connection_string

# AWS 配置
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Polymarket 配置
POLYMARKET_API_KEY=your_polymarket_api_key
POLYMARKET_SECRET=your_polymarket_secret
POLYMARKET_PASSPHRASE=your_polymarket_passphrase

# 可选：外部链接
DOCS=https://docs.polymarket.com
WEBSITE=https://polymarket.com

# 网络配置
RPC_URL=your_polygon_rpc_url
```

4. 配置 AWS Secrets Manager(可选)

## 运行方式

### 开发环境
```bash
npm run ts
```

### 使用 PM2 的生产环境
```bash
# 全局安装 PM2
npm install -g pm2

# 启动机器人
pm2 start npm --name polymarketbot -- run ts

# 保存 PM2 配置
pm2 save
pm2 startup
```

### 可选：编译后运行（JavaScript）
```bash
# 编译 TypeScript
npx tsc

# 运行编译后的版本
pm2 start dist/index.js --name polymarketbot
```

## 架构概览

### 数据库模型
- **UserInfo**：存储用户数据、钱包信息与加密后的私钥
- 机器人会话管理（Session）

### 核心组件
- **机器人接口**：基于 Telegraf 的 Telegram Bot
- **市场集成**：使用 Polymarket CLOB 客户端进行交易
- **钱包管理**：代理钱包的创建与管理
- **订单管理**：买/卖单处理逻辑
- **安全**：AWS Secrets Manager 与加密工具

### 目录结构
```
├── actions/           # 机器人行为处理
├── commands/          # 机器人指令定义
├── event/             # 市场浏览功能
├── init/              # 初始化与钱包设置
├── order/             # 下单与订单管理
├── schema/            # 数据库模型
├── start/             # 欢迎与引导
├── user/              # 用户管理与资料
└── utils/             # 工具函数与常量
```

## 安全注意事项

- 私钥在存储前会被加密
- 使用 AWS Secrets Manager 管理敏感 API 凭证
- 代理钱包提供额外的安全层
- 所有用户数据均安全存储于 MongoDB

## 贡献指南

1. Fork 本仓库
2. 创建功能分支
3. 完成功能开发
4. 如适用请补充测试
5. 提交 Pull Request

## 许可协议

ISC License

## 免责声明

本机器人仅供学习与个人使用。加密货币与预测市场交易存在风险，请谨慎操作，切勿投入超出可承受范围的资金。

## 支持与反馈

如有问题与建议：
- 在本仓库提交 Issue
- 查看 Polymarket 文档获取与 API 相关的信息