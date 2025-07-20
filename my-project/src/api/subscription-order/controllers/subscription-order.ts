export default ({ strapi }: any) => ({
  async createOrder(ctx: any) {
    const { planId } = ctx.request.body;
    const userId = ctx.state.user.id;

    try {
      const order = await strapi.service('api::subscription-order.subscription-order').createOrder(userId, planId);
      return ctx.send(order);
    } catch (error: any) {
      return ctx.badRequest(error.message);
    }
  },

  async redeemOrder(ctx: any) {
    const { orderId } = ctx.params;
    const userId = ctx.state.user.id;

    // 验证订单所有权
    const order = await strapi.db.query('api::subscription-order.subscription-order').findOne({
      where: { id: orderId, user: userId },
    });

    if (!order) {
      return ctx.notFound('Order not found');
    }

    try {
      const result = await strapi.service('api::subscription-order.subscription-order').redeemOrder(orderId);
      return ctx.send(result);
    } catch (error: any) {
      return ctx.badRequest(error.message);
    }
  },
}); 