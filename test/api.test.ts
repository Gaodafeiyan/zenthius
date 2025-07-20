import axios from 'axios';

const API_BASE_URL = 'http://localhost:1337/api';

describe('API End-to-End Tests', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // 注册测试用户
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/invite-register`, {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123456',
      inviteCode: 'TEST12345', // 需要先创建一个有邀请码的用户
    });

    authToken = registerResponse.data.jwt;
    userId = registerResponse.data.user.id;
  });

  describe('Authentication', () => {
    it('should register with invite code', async () => {
      const response = await axios.post(`${API_BASE_URL}/auth/invite-register`, {
        username: 'newuser',
        email: 'new@example.com',
        password: 'Test123456',
        inviteCode: 'TEST12345',
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.jwt).toBeDefined();
      expect(response.data.user.diamondId).toBeDefined();
      expect(response.data.user.referralCode).toBeDefined();
    });

    it('should login successfully', async () => {
      const response = await axios.post(`${API_BASE_URL}/auth/local`, {
        identifier: 'testuser',
        password: 'Test123456',
      });

      expect(response.status).toBe(200);
      expect(response.data.jwt).toBeDefined();
    });
  });

  describe('Subscription Plans', () => {
    it('should get enabled plans', async () => {
      const response = await axios.get(`${API_BASE_URL}/subscription-plans?enabled=true`);

      expect(response.status).toBe(200);
      expect(response.data.data).toBeInstanceOf(Array);
      expect(response.data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Wallet Operations', () => {
    it('should get user balance', async () => {
      const response = await axios.get(`${API_BASE_URL}/wallet-balances/my`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();
    });

    it('should get deposit address', async () => {
      const response = await axios.get(`${API_BASE_URL}/wallet-balances/deposit-address`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.address).toBeDefined();
    });
  });

  describe('Subscription Orders', () => {
    it('should create subscription order', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/subscription-orders`,
        { planCode: 'PLAN500' },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.orderNo).toBeDefined();
    });

    it('should get user orders', async () => {
      const response = await axios.get(`${API_BASE_URL}/subscription-orders/my`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeInstanceOf(Array);
    });
  });

  describe('Referral Rewards', () => {
    it('should get user rewards', async () => {
      const response = await axios.get(`${API_BASE_URL}/referral-rewards/my`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeInstanceOf(Array);
    });

    it('should get user stats', async () => {
      const response = await axios.get(`${API_BASE_URL}/referral-rewards/stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.inviteeCount).toBeDefined();
      expect(response.data.data.totalReward).toBeDefined();
    });
  });
}); 