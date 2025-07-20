import { Strapi } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Strapi }) => {
  // 确保角色存在
  const roles = await strapi.db.query('plugin::users-permissions.role').findMany();
  
  if (roles.length === 0) {
    // 创建默认角色
    await strapi.db.query('plugin::users-permissions.role').createMany({
      data: [
        {
          id: 1,
          name: 'Public',
          description: 'Default role given to unauthenticated user.',
          type: 'public',
        },
        {
          id: 2,
          name: 'Authenticated',
          description: 'Default role given to authenticated user.',
          type: 'authenticated',
        },
        {
          id: 3,
          name: 'Admin',
          description: 'Super admin role.',
          type: 'admin',
        },
      ],
    });
  }

  // 创建订阅计划种子数据
  const plans = await strapi.db.query('api::subscription-plan.subscription-plan').findMany();
  
  if (plans.length === 0) {
    await strapi.db.query('api::subscription-plan.subscription-plan').createMany({
      data: [
        {
          code: 'BASIC',
          principalUSDT: '100',
          staticYieldPct: '6',
          referralPct: '100',
          cycleDays: 30,
          maxPurchase: 10,
          enabled: true,
        },
        {
          code: 'PREMIUM',
          principalUSDT: '500',
          staticYieldPct: '8',
          referralPct: '120',
          cycleDays: 30,
          maxPurchase: 5,
          enabled: true,
        },
        {
          code: 'VIP',
          principalUSDT: '1000',
          staticYieldPct: '10',
          referralPct: '150',
          cycleDays: 30,
          maxPurchase: 3,
          enabled: true,
        },
        {
          code: 'PLATINUM',
          principalUSDT: '5000',
          staticYieldPct: '12',
          referralPct: '200',
          cycleDays: 30,
          maxPurchase: null,
          enabled: true,
        },
      ],
    });
  }
}; 