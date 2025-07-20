import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService('api::subscription-order.subscription-order', ({ strapi }) => ({
  // 创建认购订单
  async createOrder(userId: number, planCode: string) {
    // 获取计划信息
    const plan = await strapi.entityService.findMany('api::subscription-plan.subscription-plan', {
      filters: { code: planCode, enabled: true },
    });
    
    if (!plan || plan.length === 0) {
      throw new Error('Plan not found or disabled');
    }
    
    const planData = plan[0];
    
    // 检查用户余额
    const walletService = strapi.service('api::wallet-balance.wallet-balance');
    const hasBalance = await walletService.checkBalance(userId, planData.principalUSDT);
    if (!hasBalance) {
      throw new Error('Insufficient balance');
    }
    
    // 检查购买限制
    const activeOrders = await strapi.entityService.findMany('api::subscription-order.subscription-order', {
      filters: {
        user: userId,
        plan: planData.id,
        state: { $in: ['active', 'due'] },
      },
    });
    
    if (activeOrders.length >= planData.maxPurchase) {
      throw new Error('Maximum purchase limit reached');
    }
    
    // 生成订单号
    const orderNo = Math.random().toString(36).substring(2, 14).toUpperCase();
    
    // 计算收益
    const staticYield = new Decimal(planData.principalUSDT)
      .mul(planData.staticPct)
      .div(100);
    
    const tokenBonus = new Decimal(planData.principalUSDT)
      .mul(planData.tokenBonusPct)
      .div(100);
    
    // 计算结束时间
    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + planData.cycleDays * 24 * 60 * 60 * 1000);
    
    // 创建订单
    const order = await strapi.entityService.create('api::subscription-order.subscription-order', {
      data: {
        orderNo,
        user: userId,
        plan: planData.id,
        principalUSDT: planData.principalUSDT,
        staticYieldUSDT: staticYield.toNumber(),
        tokenBonusAmount: tokenBonus.toNumber(),
        cycleDays: planData.cycleDays,
        startAt,
        endAt,
        state: 'active',
        publishedAt: new Date(),
      },
    });
    
    // 扣除用户余额
    await walletService.addUSDT(userId, -planData.principalUSDT, {
      txType: 'subscription_buy',
      relatedOrder: order.id,
      memo: `认购 ${planData.code}`,
    });
    
    return order;
  },
  
  // 赎回订单
  async redeemOrder(orderId: number) {
    const order = await strapi.entityService.findOne('api::subscription-order.subscription-order', orderId, {
      populate: ['user', 'plan'],
    });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.state !== 'due') {
      throw new Error('Order is not ready for redemption');
    }
    
    const walletService = strapi.service('api::wallet-balance.wallet-balance');
    
    // 添加静态收益到用户钱包
    await walletService.addUSDT(order.user.id, order.staticYieldUSDT, {
      txType: 'subscription_redeem',
      relatedOrder: order.id,
      memo: '静态收益',
    });
    
    // 添加AI Token奖励
    await walletService.addToken(order.user.id, order.tokenBonusAmount, {
      txType: 'subscription_redeem',
      relatedOrder: order.id,
      memo: 'AI Token奖励',
    });
    
    // 处理邀请返佣
    if (order.user.invitedBy) {
      const referralAmount = new Decimal(order.staticYieldUSDT)
        .mul(order.plan.referralPct)
        .div(100);
      
      await walletService.addUSDT(order.user.invitedBy.id, referralAmount.toNumber(), {
        txType: 'referral_reward',
        relatedOrder: order.id,
        memo: `邀请返佣 - ${order.user.username}`,
      });
      
      // 记录返佣记录
      await strapi.entityService.create('api::referral-reward.referral-reward', {
        data: {
          referrer: order.user.invitedBy.id,
          fromUser: order.user.id,
          fromOrder: order.id,
          amountUSDT: referralAmount.toNumber(),
          createdAt: new Date(),
          publishedAt: new Date(),
        },
      });
      
      // 更新用户累计返佣
      await strapi.entityService.update('plugin::users-permissions.user', order.user.invitedBy.id, {
        data: {
          totalInviteEarningUSDT: new Decimal(order.user.invitedBy.totalInviteEarningUSDT || 0)
            .plus(referralAmount)
            .toNumber(),
        },
      });
    }
    
    // 更新用户累计静态收益
    await strapi.entityService.update('plugin::users-permissions.user', order.user.id, {
      data: {
        totalStaticEarningUSDT: new Decimal(order.user.totalStaticEarningUSDT || 0)
          .plus(order.staticYieldUSDT)
          .toNumber(),
      },
    });
    
    // 增加抽奖次数
    await strapi.entityService.update('plugin::users-permissions.user', order.user.id, {
      data: {
        lotterySpinQuota: (order.user.lotterySpinQuota || 0) + order.plan.spinQuota,
      },
    });
    
    // 更新订单状态
    const updatedOrder = await strapi.entityService.update('api::subscription-order.subscription-order', orderId, {
      data: {
        state: 'redeemed',
        spinQuotaGranted: true,
      },
    });
    
    return updatedOrder;
  },
  
  // 扫描到期订单
  async scanDueOrders() {
    const dueOrders = await strapi.entityService.findMany('api::subscription-order.subscription-order', {
      filters: {
        state: 'active',
        endAt: { $lte: new Date() },
      },
      populate: ['user', 'plan'],
    });
    
    for (const order of dueOrders) {
      try {
        // 将订单状态改为到期
        await strapi.entityService.update('api::subscription-order.subscription-order', order.id, {
          data: { state: 'due' },
        });
      } catch (error) {
        console.error(`Error processing due order ${order.id}:`, error);
      }
    }
    
    return dueOrders.length;
  },
})); 