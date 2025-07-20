import Decimal from 'decimal.js';

export default ({ strapi }: any) => ({
  async createWithdraw(ctx: any) {
    const { amountUSDT, toAddress } = ctx.request.body;
    const userId = ctx.state.user.id;

    // 验证余额
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: userId },
      populate: ['walletBalance'],
    });

    const balance = user.walletBalance?.usdtBalance || 0;
    if (new Decimal(balance).lt(amountUSDT)) {
      return ctx.badRequest('Insufficient balance');
    }

    // 扣除用户余额
    await strapi.db.query('api::wallet-balance.wallet-balance').update({
      where: { user: userId },
      data: {
        usdtBalance: new Decimal(balance).minus(amountUSDT).toString(),
      },
    });

    // 记录钱包交易
    await strapi.db.query('api::wallet-tx.wallet-tx').create({
      data: {
        user: userId,
        txType: 'withdraw',
        direction: 'out',
        amount: amountUSDT,
        asset: 'USDT',
        status: 'pending',
      },
    });

    // 创建提现记录
    const withdraw = await strapi.db.query('api::usdt-withdraw.usdt-withdraw').create({
      data: {
        user: userId,
        amountUSDT,
        toAddress,
        status: 'pending',
      },
    });

    return ctx.send(withdraw);
  },
}); 