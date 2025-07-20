export default {
  kind: 'collectionType',
  collectionName: 'up_users',
  info: {
    name: 'user',
    description: '',
    singularName: 'user',
    pluralName: 'users',
    displayName: 'User',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    'users-permissions': {
      visible: false,
    },
  },
  attributes: {
    username: {
      type: 'string',
      minLength: 3,
      unique: true,
      configurable: false,
      required: true,
    },
    email: {
      type: 'email',
      minLength: 6,
      configurable: false,
      required: true,
    },
    provider: {
      type: 'string',
      configurable: false,
    },
    password: {
      type: 'password',
      minLength: 6,
      configurable: false,
      searchable: false,
      private: true,
    },
    resetPasswordToken: {
      type: 'string',
      configurable: false,
      private: true,
    },
    confirmationToken: {
      type: 'string',
      configurable: false,
      private: true,
    },
    confirmed: {
      type: 'boolean',
      default: false,
      configurable: false,
    },
    blocked: {
      type: 'boolean',
      default: false,
      configurable: false,
    },
    role: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.role',
      inversedBy: 'users',
      configurable: false,
    },
    diamondId: {
      type: 'string',
      unique: true,
      required: true,
    },
    referralCode: {
      type: 'string',
      unique: true,
      required: true,
    },
    invitedBy: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'invitees',
      onDelete: 'restrict',
    },
    invitees: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'plugin::users-permissions.user',
      mappedBy: 'invitedBy',
    },
    subscriptionOrders: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::subscription-order.subscription-order',
      mappedBy: 'user',
    },
    walletBalance: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::wallet-balance.wallet-balance',
      mappedBy: 'user',
    },
    walletTransactions: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::wallet-tx.wallet-tx',
      mappedBy: 'user',
    },
    referralRewards: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::referral-reward.referral-reward',
      mappedBy: 'referrer',
    },
    usdtWithdrawals: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::usdt-withdraw.usdt-withdraw',
      mappedBy: 'user',
    },
  },
};
