export default {
  kind: 'collectionType',
  collectionName: 'subscription_orders',
  info: {
    singularName: 'subscription-order',
    pluralName: 'subscription-orders',
    displayName: 'Subscription Order',
    description: '',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'subscriptionOrders',
      onDelete: 'cascade',
    },
    plan: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::subscription-plan.subscription-plan',
      inversedBy: 'subscriptionOrders',
      onDelete: 'cascade',
    },
    state: {
      type: 'enumeration',
      enum: ['active', 'redeemed'],
      default: 'active',
      required: true,
    },
    startAt: {
      type: 'datetime',
      required: true,
    },
    endAt: {
      type: 'datetime',
      required: true,
    },
    principalUSDT: {
      type: 'decimal',
      columnType: 'numeric',
      scale: 8,
      precision: 36,
      required: true,
    },
    staticYieldUSDT: {
      type: 'decimal',
      columnType: 'numeric',
      scale: 8,
      precision: 36,
      required: true,
    },
    aiTokenAmount: {
      type: 'decimal',
      columnType: 'numeric',
      scale: 8,
      precision: 36,
      required: true,
    },
    redeemedAt: {
      type: 'datetime',
      required: false,
    },
    referralRewards: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::referral-reward.referral-reward',
      mappedBy: 'fromOrder',
    },
  },
}; 