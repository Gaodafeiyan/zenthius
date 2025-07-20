export default {
  kind: 'collectionType',
  collectionName: 'subscription_plans',
  info: {
    singularName: 'subscription-plan',
    pluralName: 'subscription-plans',
    displayName: 'Subscription Plan',
    description: '',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    code: {
      type: 'string',
      unique: true,
      required: true,
    },
    principalUSDT: {
      type: 'decimal',
      columnType: 'numeric',
      scale: 8,
      precision: 36,
      required: true,
    },
    staticYieldPct: {
      type: 'decimal',
      columnType: 'numeric',
      scale: 8,
      precision: 36,
      required: true,
    },
    referralPct: {
      type: 'decimal',
      columnType: 'numeric',
      scale: 8,
      precision: 36,
      required: true,
    },
    cycleDays: {
      type: 'integer',
      required: true,
    },
    maxPurchase: {
      type: 'integer',
      required: false,
    },
    enabled: {
      type: 'boolean',
      default: true,
      required: true,
    },
    subscriptionOrders: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::subscription-order.subscription-order',
      mappedBy: 'plan',
    },
  },
}; 