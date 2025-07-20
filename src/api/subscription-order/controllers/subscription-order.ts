import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::subscription-order.subscription-order', ({ strapi }) => ({
  // 创建认购订单
  async create(ctx) {
    const { planCode } = ctx.request.body;
    const userId = ctx.state.user.id;
    
    if (!planCode) {
      return ctx.badRequest('Plan code is required');
    }
    
    try {
      const orderService = strapi.service('api::subscription-order.subscription-order');
      const order = await orderService.createOrder(userId, planCode);
      
      return ctx.created({
        success: true,
        data: order,
        message: 'Order created successfully',
      });
    } catch (error) {
      return ctx.badRequest({
        success: false,
        message: error.message,
      });
    }
  },
  
  // 赎回订单
  async redeem(ctx) {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;
    
    try {
      const orderService = strapi.service('api::subscription-order.subscription-order');
      const order = await orderService.redeemOrder(parseInt(id));
      
      return ctx.ok({
        success: true,
        data: order,
        message: 'Order redeemed successfully',
      });
    } catch (error) {
      return ctx.badRequest({
        success: false,
        message: error.message,
      });
    }
  },
  
  // 获取用户订单列表
  async findMyOrders(ctx) {
    const userId = ctx.state.user.id;
    const { page = 1, pageSize = 10, state } = ctx.query;
    
    const filters: any = { user: userId };
    if (state) {
      filters.state = state;
    }
    
    const orders = await strapi.entityService.findMany('api::subscription-order.subscription-order', {
      filters,
      populate: ['plan'],
      sort: { createdAt: 'desc' },
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
    
    return ctx.ok({
      success: true,
      data: orders,
    });
  },
  
  // 获取到期订单列表
  async findDueOrders(ctx) {
    const userId = ctx.state.user.id;
    
    const orders = await strapi.entityService.findMany('api::subscription-order.subscription-order', {
      filters: {
        user: userId,
        state: 'due',
      },
      populate: ['plan'],
      sort: { endAt: 'asc' },
    });
    
    return ctx.ok({
      success: true,
      data: orders,
    });
  },
})); 