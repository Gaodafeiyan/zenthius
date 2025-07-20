# Strapi Investment Platform Backend

基于 Strapi v5.18 + TypeScript 的投资平台后端，支持认购计划、邀请返佣、钱包管理等功能。

## 技术栈

- **Node.js**: 18 LTS
- **Strapi**: 5.18
- **TypeScript**: 启用
- **数据库**: PostgreSQL 15 (生产) / SQLite (开发)
- **精度处理**: decimal.js
- **测试**: Vitest
- **代码规范**: ESLint + Prettier

## 功能特性

### 核心功能
- ✅ 用户注册 (带邀请码)
- ✅ 认购计划管理
- ✅ 订单创建与赎回
- ✅ 钱包余额管理
- ✅ 邀请返佣系统
- ✅ USDT 提现
- ✅ 定时任务 (订单到期扫描)

### 数据模型
- `user` - 用户模型 (扩展 Users & Permissions)
- `subscription-plan` - 认购计划
- `subscription-order` - 认购订单
- `wallet-balance` - 钱包余额
- `wallet-tx` - 钱包交易记录
- `referral-reward` - 返佣记录
- `usdt-withdraw` - USDT 提现记录

## 快速开始

### 1. 环境准备

```bash
# 安装依赖
npm install

# 复制环境变量文件
cp env.example .env.development
```

### 2. 环境配置

编辑 `.env.development` 文件，配置必要的环境变量：

```env
# 数据库配置
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# JWT 配置
JWT_SECRET=your-jwt-secret-key-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-key-here

# BSC 网络配置
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
BSC_CHAIN_ID=56

# 热钱包配置
HOT_WALLET_PRIVATE_KEY=your-hot-wallet-private-key-here
HOT_WALLET_ADDRESS=your-hot-wallet-address-here

# USDT 合约地址 (BSC)
USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
```

### 3. 启动开发服务器

```bash
# 启动开发服务器
npm run develop

# 或使用 yarn
yarn develop
```

### 4. 数据初始化

访问 `http://localhost:1337/admin` 创建管理员账户，然后运行数据种子：

```bash
# 运行数据种子 (需要先启动 Strapi)
# 种子文件会自动创建认购计划数据
```

## API 文档

### 认证相关

#### 邀请注册
```http
POST /api/auth/invite-register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123456",
  "inviteCode": "ABC123DEF"
}
```

#### 登录
```http
POST /api/auth/local
Content-Type: application/json

{
  "identifier": "testuser",
  "password": "Test123456"
}
```

### 认购计划

#### 获取计划列表
```http
GET /api/subscription-plans?enabled=true
```

### 认购订单

#### 创建订单
```http
POST /api/subscription-orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "planCode": "PLAN500"
}
```

#### 获取我的订单
```http
GET /api/subscription-orders/my?page=1&pageSize=10&state=active
Authorization: Bearer <token>
```

#### 赎回订单
```http
POST /api/subscription-orders/:id/redeem
Authorization: Bearer <token>
```

### 钱包管理

#### 获取余额
```http
GET /api/wallet-balances/my
Authorization: Bearer <token>
```

#### 获取充值地址
```http
GET /api/wallet-balances/deposit-address
Authorization: Bearer <token>
```

#### 获取交易记录
```http
GET /api/wallet-balances/transactions?page=1&pageSize=20
Authorization: Bearer <token>
```

### 提现管理

#### 创建提现申请
```http
POST /api/usdt-withdraws
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100,
  "toAddress": "0x..."
}
```

#### 获取提现记录
```http
GET /api/usdt-withdraws/my?page=1&pageSize=20&status=pending
Authorization: Bearer <token>
```

### 返佣管理

#### 获取返佣记录
```http
GET /api/referral-rewards/my?page=1&pageSize=20
Authorization: Bearer <token>
```

#### 获取邀请统计
```http
GET /api/referral-rewards/stats
Authorization: Bearer <token>
```

## 认购计划配置

系统预置了 4 个认购计划：

| 计划 | 本金 | 静态收益 | 邀请返佣 | AI Token | 最大购买 | 周期天数 |
|------|------|----------|----------|----------|----------|----------|
| PLAN500 | 500U | 6% | 100% | 3% | 2次 | 15天 |
| PLAN1K | 1000U | 7% | 90% | 4% | 3次 | 20天 |
| PLAN2K | 2000U | 8% | 80% | 5% | 4次 | 25天 |
| PLAN5K | 5000U | 10% | 70% | 6% | 5次 | 30天 |

## 开发指南

### 代码规范

```bash
# 运行 ESLint
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 格式化代码
npm run format
```

### 测试

```bash
# 运行测试
npm test

# 监听模式
npm run test:watch
```

### 数据库迁移

```bash
# 生成迁移文件
npm run strapi database:migrate

# 运行迁移
npm run strapi database:migrate:up

# 回滚迁移
npm run strapi database:migrate:down
```

## 部署

### 生产环境配置

1. 修改数据库配置为 PostgreSQL
2. 设置正确的环境变量
3. 配置 BSC 网络和热钱包
4. 设置定时任务

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 1337

CMD ["npm", "start"]
```

## 定时任务

系统包含以下定时任务：

- **订单到期扫描**: 每 10 分钟扫描到期订单
- **链上充值监控**: 每小时扫描区块链充值 (待实现)

## 权限配置

### 角色权限矩阵

| API | Public | Authenticated | Admin |
|-----|--------|---------------|-------|
| auth/local | ✅ | ✅ | ✅ |
| auth/invite-register | ✅ | ❌ | ❌ |
| subscription-plans | ✅ | ✅ | ✅ |
| subscription-orders | ❌ | ✅ | ✅ |
| wallet-balances | ❌ | ✅ | ✅ |
| usdt-withdraws | ❌ | ✅ | ✅ |
| referral-rewards | ❌ | ✅ | ✅ |

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库配置
   - 确保数据库服务运行

2. **JWT 认证失败**
   - 检查 JWT_SECRET 配置
   - 确保 token 格式正确

3. **余额计算错误**
   - 检查 decimal.js 精度设置
   - 验证钱包服务逻辑

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
