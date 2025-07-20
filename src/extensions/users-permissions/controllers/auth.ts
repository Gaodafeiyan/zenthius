import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  // 邀请注册
  async inviteRegister(ctx) {
    const { username, email, password, inviteCode } = ctx.request.body;
    
    if (!username || !email || !password || !inviteCode) {
      return ctx.badRequest('All fields are required');
    }
    
    try {
      // 验证邀请码
      const referrer = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { referralCode: inviteCode },
      });
      
      if (!referrer || referrer.length === 0) {
        return ctx.badRequest('Invalid invite code');
      }
      
      const referrerUser = referrer[0];
      
      // 检查用户名和邮箱是否已存在
      const existingUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: {
          $or: [
            { username },
            { email },
          ],
        },
      });
      
      if (existingUser && existingUser.length > 0) {
        return ctx.badRequest('Username or email already exists');
      }
      
      // 创建用户
      const user = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username,
          email,
          password,
          confirmed: true,
          invitedBy: referrerUser.id,
          publishedAt: new Date(),
        },
      });
      
      // 生成JWT token
      const jwt = strapi.plugin('users-permissions').service('jwt').issue({
        id: user.id,
      });
      
      return ctx.created({
        success: true,
        jwt,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          diamondId: user.diamondId,
          referralCode: user.referralCode,
        },
      });
    } catch (error) {
      return ctx.badRequest({
        success: false,
        message: error.message,
      });
    }
  },
})); 