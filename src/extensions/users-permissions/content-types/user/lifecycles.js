const { v4: uuidv4 } = require('uuid');

module.exports = {
  beforeCreate: async (event) => {
    const { data } = event.params;
    
    // 生成唯一的 diamondId (9位数字)
    let diamondId;
    do {
      diamondId = Math.floor(100000000 + Math.random() * 900000000).toString();
    } while (await strapi.query('plugin::users-permissions.user').findOne({ where: { diamondId } }));
    
    // 生成唯一的 referralCode (9位字母数字组合)
    let referralCode;
    do {
      referralCode = Math.random().toString(36).substring(2, 11).toUpperCase();
    } while (await strapi.query('plugin::users-permissions.user').findOne({ where: { referralCode } }));
    
    data.diamondId = diamondId;
    data.referralCode = referralCode;
  },
  
  afterCreate: async (event) => {
    const { result } = event;
    
    // 初始化钱包余额
    await strapi.entityService.create('api::wallet-balance.wallet-balance', {
      data: {
        user: result.id,
        usdtBalance: 0,
        aiTokenBalance: 0,
        publishedAt: new Date(),
      },
    });
  },
}; 