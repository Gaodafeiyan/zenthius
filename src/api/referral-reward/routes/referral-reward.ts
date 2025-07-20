export default {
  routes: [
    {
      method: 'GET',
      path: '/referral-rewards/my',
      handler: 'referral-reward.findMyRewards',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/referral-rewards/stats',
      handler: 'referral-reward.getMyStats',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
  ],
}; 