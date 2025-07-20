import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Strapi } from '@strapi/strapi';

let strapi: Strapi;

beforeAll(async () => {
  strapi = await Strapi().load();
});

afterAll(async () => {
  await strapi.destroy();
});

describe('API Tests', () => {
  it('should create user with diamondId and referralCode', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    };

    const user = await strapi.db.query('plugin::users-permissions.user').create({
      data: userData,
    });

    expect(user.diamondId).toBeDefined();
    expect(user.referralCode).toBeDefined();
    expect(user.diamondId.length).toBe(9);
    expect(user.referralCode.length).toBe(8);
  });

  it('should create wallet balance for new user', async () => {
    const user = await strapi.db.query('plugin::users-permissions.user').create({
      data: {
        email: 'test2@example.com',
        username: 'testuser2',
        password: 'password123',
      },
    });

    const balance = await strapi.db.query('api::wallet-balance.wallet-balance').findOne({
      where: { user: user.id },
    });

    expect(balance).toBeDefined();
    expect(balance.usdtBalance).toBe('0');
    expect(balance.aiTokenBalance).toBe('0');
  });

  it('should create subscription order', async () => {
    const user = await strapi.db.query('plugin::users-permissions.user').create({
      data: {
        email: 'test3@example.com',
        username: 'testuser3',
        password: 'password123',
      },
    });

    // 创建钱包余额
    await strapi.db.query('api::wallet-balance.wallet-balance').create({
      data: {
        user: user.id,
        usdtBalance: '1000',
        aiTokenBalance: '0',
      },
    });

    const plan = await strapi.db.query('api::subscription-plan.subscription-plan').findOne({
      where: { code: 'BASIC' },
    });

    const order = await strapi.service('api::subscription-order.subscription-order').createOrder(user.id, plan.id);

    expect(order.user).toBe(user.id);
    expect(order.plan).toBe(plan.id);
    expect(order.state).toBe('active');
  });
}); 