import cron from 'node-cron';

export default ({ strapi }: { strapi: any }) => {
  // 每分钟扫描过期订单
  cron.schedule('* * * * *', async () => {
    try {
      console.log('🔄 Scanning for due orders...');
      await strapi.service('api::subscription-order.subscription-order').scanDueOrders();
    } catch (error) {
      console.error('❌ Error scanning due orders:', error);
    }
  });

  // 每5分钟扫描区块链充值
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🔄 Scanning blockchain deposits...');
      await strapi.service('api::wallet-balance.wallet-balance').scanBlockchainDeposits();
    } catch (error) {
      console.error('❌ Error scanning blockchain deposits:', error);
    }
  });

  // 每10分钟处理提现
  cron.schedule('*/10 * * * *', async () => {
    try {
      console.log('🔄 Processing withdrawals...');
      await strapi.service('api::wallet-balance.wallet-balance').processWithdrawals();
    } catch (error) {
      console.error('❌ Error processing withdrawals:', error);
    }
  });

  console.log('✅ Cron jobs initialized');
}; 