export default {
  routes: [
    {
      method: 'GET',
      path: '/referral-rewards/my',
      handler: 'referral-reward.getMyRewards',
      config: {
        auth: {
          scopes: ['authenticated'],
        },
      },
    },
  ],
}; 