export default ({ strapi }: any) => ({
  async getMyRewards(ctx: any) {
    const userId = ctx.state.user.id;

    const rewards = await strapi.db.query('api::referral-reward.referral-reward').findMany({
      where: { referrer: userId },
      populate: ['fromUser', 'fromOrder'],
      orderBy: { createdAt: 'desc' },
    });

    return ctx.send(rewards);
  },
}); 