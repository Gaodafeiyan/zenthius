import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::referral-reward.referral-reward', ({ strapi }) => ({
  // 获取用户返佣记录
  async findMyRewards(ctx) {
    const userId = ctx.state.user.id;
    const { page = 1, pageSize = 20 } = ctx.query;
    
    const rewards = await strapi.entityService.findMany('api::referral-reward.referral-reward', {
      filters: { referrer: userId },
      sort: { createdAt: 'desc' },
      populate: ['fromUser', 'fromOrder'],
      pagination: {
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      },
    });
    
    return ctx.ok({
      success: true,
      data: rewards,
    });
  },
  
  // 获取用户邀请统计
  async getMyStats(ctx) {
    const userId = ctx.state.user.id;
    
    // 获取邀请人数
    const invitees = await strapi.entityService.findMany('plugin::users-permissions.user', {
      filters: { invitedBy: userId },
    });
    
    // 获取累计返佣
    const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
    
    return ctx.ok({
      success: true,
      data: {
        inviteeCount: invitees.length,
        totalReward: user.totalInviteEarningUSDT || 0,
      },
    });
  },
})); 