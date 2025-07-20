export default {
  routes: [
    {
      method: 'POST',
      path: '/subscription-orders/create',
      handler: 'subscription-order.createOrder',
      config: {
        auth: {
          scopes: ['authenticated'],
        },
      },
    },
    {
      method: 'POST',
      path: '/subscription-orders/:orderId/redeem',
      handler: 'subscription-order.redeemOrder',
      config: {
        auth: {
          scopes: ['authenticated'],
        },
      },
    },
  ],
}; 