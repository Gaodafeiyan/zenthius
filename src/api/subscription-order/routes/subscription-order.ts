export default {
  routes: [
    {
      method: 'POST',
      path: '/subscription-orders',
      handler: 'subscription-order.create',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/subscription-orders/my',
      handler: 'subscription-order.findMyOrders',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/subscription-orders/due',
      handler: 'subscription-order.findDueOrders',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'POST',
      path: '/subscription-orders/:id/redeem',
      handler: 'subscription-order.redeem',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
  ],
}; 