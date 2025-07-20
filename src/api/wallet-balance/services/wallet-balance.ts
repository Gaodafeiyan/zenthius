import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';

export default factories.createCoreService('api::wallet-balance.wallet-balance', ({ strapi }) => ({
  // 获取用户钱包余额
  async getUserBalance(userId: number) {
    const balance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance', {
      filters: { user: userId },
      populate: ['user'],
    });
    return balance[0] || null;
  },

  // 添加USDT余额
  async addUSDT(userId: number, amount: number, meta?: any) {
    const balance = await this.getUserBalance(userId);
    if (!balance) {
      throw new Error('Wallet balance not found');
    }

    const newBalance = new Decimal(balance.usdtBalance || 0).plus(amount);
    
    const updatedBalance = await strapi.entityService.update('api::wallet-balance.wallet-balance', balance.id, {
      data: {
        usdtBalance: newBalance.toNumber(),
      },
    });

    // 同步更新用户表中的冗余字段
    await strapi.entityService.update('plugin::users-permissions.user', userId, {
      data: {
        walletBalanceUSDT: newBalance.toNumber(),
      },
    });

    // 记录交易
    if (meta) {
      await strapi.entityService.create('api::wallet-tx.wallet-tx', {
        data: {
          user: userId,
          walletBalance: balance.id,
          txType: meta.txType || 'deposit',
          direction: amount > 0 ? 'in' : 'out',
          amountUSDT: Math.abs(amount),
          status: 'success',
          memo: meta.memo || '',
          txHash: meta.txHash,
          relatedOrder: meta.relatedOrder,
          publishedAt: new Date(),
        },
      });
    }

    return updatedBalance;
  },

  // 添加AI Token余额
  async addToken(userId: number, amount: number, meta?: any) {
    const balance = await this.getUserBalance(userId);
    if (!balance) {
      throw new Error('Wallet balance not found');
    }

    const newBalance = new Decimal(balance.aiTokenBalance || 0).plus(amount);
    
    const updatedBalance = await strapi.entityService.update('api::wallet-balance.wallet-balance', balance.id, {
      data: {
        aiTokenBalance: newBalance.toNumber(),
      },
    });

    // 记录交易
    if (meta) {
      await strapi.entityService.create('api::wallet-tx.wallet-tx', {
        data: {
          user: userId,
          walletBalance: balance.id,
          txType: meta.txType || 'airdrop',
          direction: amount > 0 ? 'in' : 'out',
          amountUSDT: 0,
          amountToken: Math.abs(amount),
          status: 'success',
          memo: meta.memo || '',
          txHash: meta.txHash,
          relatedOrder: meta.relatedOrder,
          publishedAt: new Date(),
        },
      });
    }

    return updatedBalance;
  },

  // 检查余额是否足够
  async checkBalance(userId: number, requiredAmount: number): Promise<boolean> {
    const balance = await this.getUserBalance(userId);
    if (!balance) return false;
    
    return new Decimal(balance.usdtBalance || 0).gte(requiredAmount);
  },

  // 获取充值地址
  async getDepositAddress(userId: number): Promise<string> {
    // 这里应该实现生成唯一充值地址的逻辑
    // 暂时返回一个示例地址
    return `0x${userId.toString().padStart(40, '0')}`;
  },

  // 扫描 BSC 链上充值
  async scanBlockchainDeposits() {
    try {
      const BSC_RPC_URL = process.env.BSC_RPC_URL;
      const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;
      
      if (!BSC_RPC_URL || !USDT_CONTRACT_ADDRESS) {
        console.log('❌ BSC 配置缺失');
        return;
      }

      const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
      
      // USDT 合约 ABI (简化版)
      const USDT_ABI = [
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ];
      
      const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);
      
      // 获取所有用户
      const users = await strapi.entityService.findMany('plugin::users-permissions.user');
      
      for (const user of users) {
        const depositAddress = await this.getDepositAddress(user.id);
        
        // 扫描最近100个区块的交易
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 100);
        
        // 监听 Transfer 事件
        const filter = usdtContract.filters.Transfer(null, depositAddress);
        const events = await usdtContract.queryFilter(filter, fromBlock, currentBlock);
        
        for (const event of events) {
          const txHash = event.transactionHash;
          const amount = ethers.formatUnits(event.args.value, 18); // USDT 18位小数
          
          // 检查是否已处理
          const existingTx = await strapi.entityService.findMany('api::wallet-tx.wallet-tx', {
            filters: { txHash }
          });
          
          if (existingTx.length === 0) {
            // 处理新充值
            await this.addUSDT(user.id, parseFloat(amount), {
              txType: 'deposit',
              txHash: txHash,
              memo: 'BSC 链上充值'
            });
            
            console.log(`✅ 用户 ${user.id} 充值 ${amount}U`);
          }
        }
      }
    } catch (error) {
      console.error('❌ 扫描链上充值错误:', error);
    }
  },

  // 执行提现转账
  async processWithdrawals() {
    try {
      const HOT_WALLET_PRIVATE_KEY = process.env.HOT_WALLET_PRIVATE_KEY;
      const BSC_RPC_URL = process.env.BSC_RPC_URL;
      const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;
      
      if (!HOT_WALLET_PRIVATE_KEY || !BSC_RPC_URL || !USDT_CONTRACT_ADDRESS) {
        console.log('❌ 热钱包配置缺失');
        return;
      }

      const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
      const hotWallet = new ethers.Wallet(HOT_WALLET_PRIVATE_KEY, provider);
      
      const USDT_ABI = [
        "function transfer(address to, uint256 amount) returns (bool)"
      ];
      
      const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);
      
      // 获取待处理的提现申请
      const pendingWithdraws = await strapi.entityService.findMany('api::usdt-withdraw.usdt-withdraw', {
        filters: { status: 'pending' }
      });
      
      for (const withdraw of pendingWithdraws) {
        try {
          // 检查热钱包余额
          const hotWalletBalance = await usdtContract.balanceOf(hotWallet.address);
          const withdrawAmount = ethers.parseUnits(withdraw.amount.toString(), 18);
          
          if (hotWalletBalance >= withdrawAmount) {
            // 执行转账
            const tx = await usdtContract.connect(hotWallet).transfer(
              withdraw.toAddress, 
              withdrawAmount
            );
            
            const receipt = await tx.wait();
            
            // 更新提现状态
            await strapi.entityService.update('api::usdt-withdraw.usdt-withdraw', withdraw.id, {
              data: {
                status: 'success',
                txHash: receipt.hash
              }
            });
            
            console.log(`✅ 提现成功: ${withdraw.amount}U → ${withdraw.toAddress}`);
          } else {
            console.log(`❌ 热钱包余额不足: ${ethers.formatUnits(hotWalletBalance, 18)}U`);
          }
        } catch (error) {
          console.error(`❌ 提现处理错误 (ID: ${withdraw.id}):`, error);
          
          // 更新状态为失败
          await strapi.entityService.update('api::usdt-withdraw.usdt-withdraw', withdraw.id, {
            data: { status: 'failed' }
          });
        }
      }
    } catch (error) {
      console.error('❌ 处理提现错误:', error);
    }
  },
})); 