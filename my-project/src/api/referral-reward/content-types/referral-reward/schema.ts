export default {
  kind: 'collectionType',
  collectionName: 'referral_rewards',
  info: {
    singularName: 'referral-reward',
    pluralName: 'referral-rewards',
    displayName: 'Referral Reward',
    description: '',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    referrer: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'referralRewards',
      onDelete: 'cascade',
    },
    fromUser: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      onDelete: 'cascade',
    },
    fromOrder: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::subscription-order.subscription-order',
      inversedBy: 'referralRewards',
      onDelete: 'cascade',
    },
    amountUSDT: {
      type: 'decimal',
      columnType: 'numeric',
      scale: 8,
      precision: 36,
      required: true,
    },
  },
}; 