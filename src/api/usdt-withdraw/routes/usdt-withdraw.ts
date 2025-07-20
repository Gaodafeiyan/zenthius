export default {
  routes: [
    {
      method: 'POST',
      path: '/usdt-withdraws',
      handler: 'usdt-withdraw.create',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/usdt-withdraws/my',
      handler: 'usdt-withdraw.findMyWithdraws',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
  ],
}; 