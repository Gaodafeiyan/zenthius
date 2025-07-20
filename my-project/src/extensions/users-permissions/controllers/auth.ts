export default ({ strapi }: any) => ({
  async inviteRegister(ctx: any) {
    const { email, username, password, inviteCode } = ctx.request.body;

    // 验证邀请码
    let invitedBy = null;
    if (inviteCode) {
      const inviter = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { referralCode: inviteCode },
      });
      if (!inviter) {
        return ctx.badRequest('Invalid invite code');
      }
      invitedBy = inviter.id;
    }

    // 创建用户
    const user = await strapi.db.query('plugin::users-permissions.user').create({
      data: {
        email,
        username,
        password,
        confirmed: true,
        blocked: false,
        role: 2, // authenticated role
        invitedBy,
      },
    });

    // 创建钱包余额记录
    await strapi.db.query('api::wallet-balance.wallet-balance').create({
      data: {
        user: user.id,
        usdtBalance: 0,
        aiTokenBalance: 0,
      },
    });

    // 生成 JWT token
    const jwt = strapi.plugin('users-permissions').service('jwt').issue({
      id: user.id,
    });

    return {
      jwt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        diamondId: user.diamondId,
        referralCode: user.referralCode,
      },
    };
  },
}); 