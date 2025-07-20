export default {
  routes: [
    {
      method: 'POST',
      path: '/usdt-withdraws/create',
      handler: 'usdt-withdraw.createWithdraw',
      config: {
        auth: {
          scopes: ['authenticated'],
        },
      },
    },
  ],
}; 