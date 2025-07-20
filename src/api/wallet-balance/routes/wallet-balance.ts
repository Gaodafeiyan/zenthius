export default {
  routes: [
    {
      method: 'GET',
      path: '/wallet-balances/my',
      handler: 'wallet-balance.findMyBalance',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/wallet-balances/deposit-address',
      handler: 'wallet-balance.getDepositAddress',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/wallet-balances/transactions',
      handler: 'wallet-balance.findMyTransactions',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
  ],
}; 