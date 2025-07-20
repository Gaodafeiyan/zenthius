import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::usdt-withdraw.usdt-withdraw', ({ strapi }) => ({
  // 创建提现申请
  async create(ctx) {
    const { amount, toAddress } = ctx.request.body;
    const userId = ctx.state.user.id;
    
    if (!amount || !toAddress) {
      return ctx.badRequest('Amount and toAddress are required');
    }
    
    if (amount <= 0) {
      return ctx.badRequest('Amount must be greater than 0');
    }
    
    try {
      // 检查用户余额
      const walletService = strapi.service('api::wallet-balance.wallet-balance');
      const hasBalance = await walletService.checkBalance(userId, amount);
      if (!hasBalance) {
        return ctx.badRequest('Insufficient balance');
      }
      
      // 创建提现记录
      const withdraw = await strapi.entityService.create('api::usdt-withdraw.usdt-withdraw', {
        data: {
          user: userId,
          amount,
          toAddress,
          status: 'pending',
          publishedAt: new Date(),
        },
      });
      
      // 扣除用户余额
      await walletService.addUSDT(userId, -amount, {
        txType: 'usdt_withdraw',
        memo: `提现到 ${toAddress}`,
      });
      
      return ctx.created({
        success: true,
        data: withdraw,
        message: 'Withdraw request created successfully',
      });
    } catch (error) {
      return ctx.badRequest({
        success: false,
        message: error.message,
      });
    }
  },
  
  // 获取用户提现记录
  async findMyWithdraws(ctx) {
    const userId = ctx.state.user.id;
    const { page = 1, pageSize = 20, status } = ctx.query;
    
    const filters: any = { user: userId };
    if (status) {
      filters.status = status;
    }
    
    const withdraws = await strapi.entityService.findMany('api::usdt-withdraw.usdt-withdraw', {
      filters,
      sort: { createdAt: 'desc' },
      pagination: {
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      },
    });
    
    return ctx.ok({
      success: true,
      data: withdraws,
    });
  },
})); 