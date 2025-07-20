import { Strapi } from '@strapi/strapi';
import cron from 'node-cron';

export default ({ strapi }: { strapi: Strapi }) => {
  // 每10分钟扫描到期订单
  cron.schedule('*/10 * * * *', async () => {
    try {
      console.log('🔄 扫描到期订单...');
      const orderService = strapi.service('api::subscription-order.subscription-order');
      const processedCount = await orderService.scanDueOrders();
      console.log(`✅ 处理了 ${processedCount} 个到期订单`);
    } catch (error) {
      console.error('❌ 扫描到期订单错误:', error);
    }
  });

  // 每小时扫描链上充值
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔄 扫描 BSC 链上充值...');
      const walletService = strapi.service('api::wallet-balance.wallet-balance');
      await walletService.scanBlockchainDeposits();
    } catch (error) {
      console.error('❌ 扫描链上充值错误:', error);
    }
  });

  // 每5分钟处理提现队列
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🔄 处理提现队列...');
      const walletService = strapi.service('api::wallet-balance.wallet-balance');
      await walletService.processWithdrawals();
    } catch (error) {
      console.error('❌ 处理提现错误:', error);
    }
  });
}; 