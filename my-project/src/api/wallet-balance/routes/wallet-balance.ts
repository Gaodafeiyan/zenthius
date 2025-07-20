export default {
  routes: [
    {
      method: 'GET',
      path: '/wallet-balances/my',
      handler: 'wallet-balance.getMyBalance',
      config: {
        auth: {
          scopes: ['authenticated'],
        },
      },
    },
  ],
}; 