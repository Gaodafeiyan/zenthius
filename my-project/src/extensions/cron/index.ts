import cron from 'node-cron';

export default ({ strapi }: any) => {
  // 每 5 分钟扫描到期的订单
  cron.schedule('*/5 * * * *', async () => {
    try {
      const dueOrders = await strapi.db.query('api::subscription-order.subscription-order').findMany({
        where: {
          state: 'active',
          endAt: {
            $lte: new Date(),
          },
        },
        populate: ['user', 'plan'],
      });

      for (const order of dueOrders) {
        try {
          await strapi.service('api::subscription-order.subscription-order').redeemOrder(order.id);
          console.log(`Order ${order.id} redeemed successfully`);
        } catch (error) {
          console.error(`Failed to redeem order ${order.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });

  // 每晚 1 点汇总统计
  cron.schedule('0 1 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = {
        totalOrders: await strapi.db.query('api::subscription-order.subscription-order').count(),
        activeOrders: await strapi.db.query('api::subscription-order.subscription-order').count({
          where: { state: 'active' },
        }),
        totalUsers: await strapi.db.query('plugin::users-permissions.user').count(),
        totalWithdrawals: await strapi.db.query('api::usdt-withdraw.usdt-withdraw').count(),
        pendingWithdrawals: await strapi.db.query('api::usdt-withdraw.usdt-withdraw').count({
          where: { status: 'pending' },
        }),
      };

      console.log('Daily stats:', stats);
    } catch (error) {
      console.error('Stats cron job error:', error);
    }
  });
}; 