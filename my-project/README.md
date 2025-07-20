# Investment Platform Backend

基于 Strapi v5.18 + TypeScript 的投资平台后端实现。

## 功能特性

- 用户管理（diamondId、referralCode、邀请关系）
- 订阅计划管理（4个档位）
- 订单管理（购买、赎回）
- 钱包管理（USDT、AI Token）
- 推荐奖励系统
- USDT 提现功能
- 定时任务（自动赎回、统计）

## 技术栈

- Strapi v5.18
- TypeScript
- SQLite (开发) / PostgreSQL (生产)
- decimal.js (精确计算)
- node-cron (定时任务)

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run develop
```

### 运行测试

```bash
npm test
```

### 检查角色

```bash
node scripts/checkRoles.js
```

## API 端点

### 认证

- `POST /api/auth/invite-register` - 邀请注册

### 订阅订单

- `POST /api/subscription-orders/create` - 创建订单
- `POST /api/subscription-orders/:orderId/redeem` - 赎回订单

### 钱包

- `GET /api/wallet-balances/my` - 获取我的余额

### 提现

- `POST /api/usdt-withdraws/create` - 创建提现

### 推荐奖励

- `GET /api/referral-rewards/my` - 获取我的推荐奖励

## 数据模型

### User (扩展)
- diamondId (string, unique)
- referralCode (string, unique)
- invitedBy (relation)
- invitees (relation)

### Subscription Plan
- code (string, unique)
- principalUSDT (decimal)
- staticYieldPct (decimal)
- referralPct (decimal)
- cycleDays (integer)
- maxPurchase (integer)
- enabled (boolean)

### Subscription Order
- user (relation)
- plan (relation)
- state (enum: active/redeemed)
- startAt, endAt (datetime)
- principalUSDT, staticYieldUSDT (decimal)
- aiTokenAmount (decimal)
- redeemedAt (datetime)

### Wallet Balance
- user (relation, unique)
- usdtBalance (decimal)
- aiTokenBalance (decimal)

### Wallet Transaction
- user (relation)
- txType (enum)
- direction (enum: in/out)
- amount (decimal)
- asset (enum: USDT/AIToken)
- txHash (string)
- status (enum: pending/success/failed)

### Referral Reward
- referrer (relation)
- fromUser (relation)
- fromOrder (relation)
- amountUSDT (decimal)

### USDT Withdraw
- user (relation)
- amountUSDT (decimal)
- toAddress (string)
- status (enum: pending/sent/failed)
- txHash (string)

## 业务逻辑

### 用户注册
1. 生成 9 位 diamondId
2. 生成 8 位 referralCode
3. 如果提供邀请码，建立邀请关系
4. 创建钱包余额记录

### 订单购买
1. 检查用户余额
2. 检查购买次数限制
3. 扣除用户余额
4. 记录钱包交易
5. 创建订单

### 订单赎回
1. 检查订单状态和到期时间
2. 更新用户钱包余额
3. 记录钱包交易
4. 处理推荐奖励
5. 更新订单状态

### 定时任务
- 每 5 分钟扫描到期订单并自动赎回
- 每晚 1 点生成统计报告

## 开发指南

### 添加新的内容类型

1. 在 `src/api/` 下创建新的内容类型
2. 使用 TypeScript schema 文件
3. 添加控制器和路由
4. 更新权限配置

### 数据库迁移

```bash
npm run strapi database:migrate
```

### 种子数据

```bash
npm run strapi database:seed
```

## 部署

### 生产环境

1. 设置环境变量
2. 配置数据库连接
3. 运行迁移
4. 启动服务

```bash
NODE_ENV=production npm run start
```

## 许可证

MIT 