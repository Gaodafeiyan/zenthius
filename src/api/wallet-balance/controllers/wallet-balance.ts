import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::wallet-balance.wallet-balance', ({ strapi }) => ({
  // 获取用户钱包余额
  async findMyBalance(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      const walletService = strapi.service('api::wallet-balance.wallet-balance');
      const balance = await walletService.getUserBalance(userId);
      
      return ctx.ok({
        success: true,
        data: balance,
      });
    } catch (error) {
      return ctx.badRequest({
        success: false,
        message: error.message,
      });
    }
  },
  
  // 获取充值地址
  async getDepositAddress(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      const walletService = strapi.service('api::wallet-balance.wallet-balance');
      const address = await walletService.getDepositAddress(userId);
      
      return ctx.ok({
        success: true,
        data: { address },
      });
    } catch (error) {
      return ctx.badRequest({
        success: false,
        message: error.message,
      });
    }
  },
  
  // 获取用户交易记录
  async findMyTransactions(ctx) {
    const userId = ctx.state.user.id;
    const { page = 1, pageSize = 20 } = ctx.query;
    
    const transactions = await strapi.entityService.findMany('api::wallet-tx.wallet-tx', {
      filters: { user: userId },
      sort: { createdAt: 'desc' },
      populate: ['relatedOrder'],
      pagination: {
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      },
    });
    
    return ctx.ok({
      success: true,
      data: transactions,
    });
  },
})); 