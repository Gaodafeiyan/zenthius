import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService('api::subscription-order.subscription-order', ({ strapi }) => ({
  async createOrder(userId: number, planId: number) {
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: userId },
      populate: ['walletBalance'],
    });

    const plan = await strapi.db.query('api::subscription-plan.subscription-plan').findOne({
      where: { id: planId },
    });

    if (!plan || !plan.enabled) {
      throw new Error('Plan not found or disabled');
    }

    // 检查用户余额
    const balance = user.walletBalance?.usdtBalance || 0;
    if (new Decimal(balance).lt(plan.principalUSDT)) {
      throw new Error('Insufficient balance');
    }

    // 检查购买次数限制
    if (plan.maxPurchase) {
      const existingOrders = await strapi.db.query('api::subscription-order.subscription-order').count({
        where: {
          user: userId,
          plan: planId,
        },
      });
      if (existingOrders >= plan.maxPurchase) {
        throw new Error('Purchase limit reached');
      }
    }

    // 扣除用户余额
    await strapi.db.query('api::wallet-balance.wallet-balance').update({
      where: { user: userId },
      data: {
        usdtBalance: new Decimal(balance).minus(plan.principalUSDT).toString(),
      },
    });

    // 记录钱包交易
    await strapi.db.query('api::wallet-tx.wallet-tx').create({
      data: {
        user: userId,
        txType: 'subscription',
        direction: 'out',
        amount: plan.principalUSDT,
        asset: 'USDT',
        status: 'success',
      },
    });

    // 计算收益
    const staticYieldUSDT = new Decimal(plan.principalUSDT)
      .mul(plan.staticYieldPct)
      .div(100)
      .toString();

    const aiTokenAmount = new Decimal(plan.principalUSDT)
      .mul(0.1) // 10% AI Token 奖励
      .toString();

    // 创建订单
    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + plan.cycleDays * 24 * 60 * 60 * 1000);

    const order = await strapi.db.query('api::subscription-order.subscription-order').create({
      data: {
        user: userId,
        plan: planId,
        state: 'active',
        startAt,
        endAt,
        principalUSDT: plan.principalUSDT,
        staticYieldUSDT,
        aiTokenAmount,
      },
    });

    return order;
  },

  async redeemOrder(orderId: number) {
    const order = await strapi.db.query('api::subscription-order.subscription-order').findOne({
      where: { id: orderId },
      populate: ['user', 'plan'],
    });

    if (!order || order.state !== 'active') {
      throw new Error('Order not found or already redeemed');
    }

    if (new Date() < order.endAt) {
      throw new Error('Order not yet due');
    }

    // 更新用户钱包余额
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: order.user.id },
      populate: ['walletBalance'],
    });

    const currentBalance = user.walletBalance?.usdtBalance || 0;
    const currentAiTokenBalance = user.walletBalance?.aiTokenBalance || 0;

    await strapi.db.query('api::wallet-balance.wallet-balance').update({
      where: { user: order.user.id },
      data: {
        usdtBalance: new Decimal(currentBalance)
          .plus(order.principalUSDT)
          .plus(order.staticYieldUSDT)
          .toString(),
        aiTokenBalance: new Decimal(currentAiTokenBalance)
          .plus(order.aiTokenAmount)
          .toString(),
      },
    });

    // 记录钱包交易
    await strapi.db.query('api::wallet-tx.wallet-tx').create({
      data: {
        user: order.user.id,
        txType: 'redeem',
        direction: 'in',
        amount: new Decimal(order.principalUSDT).plus(order.staticYieldUSDT).toString(),
        asset: 'USDT',
        status: 'success',
      },
    });

    await strapi.db.query('api::wallet-tx.wallet-tx').create({
      data: {
        user: order.user.id,
        txType: 'redeem',
        direction: 'in',
        amount: order.aiTokenAmount,
        asset: 'AIToken',
        status: 'success',
      },
    });

    // 处理推荐奖励
    if (order.user.invitedBy) {
      const referrer = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: order.user.invitedBy },
        populate: ['walletBalance'],
      });

      if (referrer) {
        const rewardAmount = new Decimal(order.principalUSDT)
          .mul(order.plan.referralPct)
          .div(100)
          .toString();

        // 创建推荐奖励记录
        await strapi.db.query('api::referral-reward.referral-reward').create({
          data: {
            referrer: referrer.id,
            fromUser: order.user.id,
            fromOrder: order.id,
            amountUSDT: rewardAmount,
          },
        });

        // 更新推荐人钱包余额
        const referrerBalance = referrer.walletBalance?.usdtBalance || 0;
        await strapi.db.query('api::wallet-balance.wallet-balance').update({
          where: { user: referrer.id },
          data: {
            usdtBalance: new Decimal(referrerBalance).plus(rewardAmount).toString(),
          },
        });

        // 记录推荐人钱包交易
        await strapi.db.query('api::wallet-tx.wallet-tx').create({
          data: {
            user: referrer.id,
            txType: 'referral',
            direction: 'in',
            amount: rewardAmount,
            asset: 'USDT',
            status: 'success',
          },
        });
      }
    }

    // 更新订单状态
    await strapi.db.query('api::subscription-order.subscription-order').update({
      where: { id: orderId },
      data: {
        state: 'redeemed',
        redeemedAt: new Date(),
      },
    });

    return order;
  },
})); 