export default ({ strapi }: any) => ({
  async getMyBalance(ctx: any) {
    const userId = ctx.state.user.id;

    const balance = await strapi.db.query('api::wallet-balance.wallet-balance').findOne({
      where: { user: userId },
    });

    if (!balance) {
      // 如果用户没有钱包余额记录，创建一个
      const newBalance = await strapi.db.query('api::wallet-balance.wallet-balance').create({
        data: {
          user: userId,
          usdtBalance: 0,
          aiTokenBalance: 0,
        },
      });
      return ctx.send(newBalance);
    }

    return ctx.send(balance);
  },
}); 