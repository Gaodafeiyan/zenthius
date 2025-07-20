'use strict';

module.exports = {
  async up(db) {
    const plans = [
      {
        code: 'PLAN500',
        principalUSDT: 500,
        boxes: 10,
        cycleDays: 15,
        staticPct: 6,
        referralPct: 100,
        tokenBonusPct: 3,
        maxPurchase: 2,
        unlockRule: '无限制',
        spinQuota: 3,
        enabled: true,
        publishedAt: new Date(),
      },
      {
        code: 'PLAN1K',
        principalUSDT: 1000,
        boxes: 20,
        cycleDays: 20,
        staticPct: 7,
        referralPct: 90,
        tokenBonusPct: 4,
        maxPurchase: 3,
        unlockRule: '完成2次PLAN500赎回后解锁',
        spinQuota: 3,
        enabled: true,
        publishedAt: new Date(),
      },
      {
        code: 'PLAN2K',
        principalUSDT: 2000,
        boxes: 40,
        cycleDays: 25,
        staticPct: 8,
        referralPct: 80,
        tokenBonusPct: 5,
        maxPurchase: 4,
        unlockRule: '完成3次PLAN1K赎回后解锁',
        spinQuota: 3,
        enabled: true,
        publishedAt: new Date(),
      },
      {
        code: 'PLAN5K',
        principalUSDT: 5000,
        boxes: 100,
        cycleDays: 30,
        staticPct: 10,
        referralPct: 70,
        tokenBonusPct: 6,
        maxPurchase: 5,
        unlockRule: '完成4次PLAN2K赎回后解锁',
        spinQuota: 3,
        enabled: true,
        publishedAt: new Date(),
      },
    ];

    for (const plan of plans) {
      await db.collection('subscription_plans').insertOne(plan);
    }
  },

  async down(db) {
    await db.collection('subscription_plans').deleteMany({
      code: { $in: ['PLAN500', 'PLAN1K', 'PLAN2K', 'PLAN5K'] }
    });
  }
}; 