export default {
  info: {
    singularName: 'user',
    pluralName: 'users',
    displayName: 'User',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    username: {
      type: 'string',
      unique: true,
      minLength: 3,
    },
    email: {
      type: 'email',
      unique: true,
      required: true,
    },
    provider: {
      type: 'string',
    },
    password: {
      type: 'password',
      private: true,
      minLength: 6,
    },
    resetPasswordToken: {
      type: 'string',
      private: true,
    },
    confirmationToken: {
      type: 'string',
      private: true,
    },
    confirmed: {
      type: 'boolean',
      default: false,
    },
    blocked: {
      type: 'boolean',
      default: false,
    },
    role: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.role',
      inversedBy: 'users',
      configurable: false,
    },
    // 扩展字段
    diamondId: {
      type: 'uid',
      unique: true,
      required: true,
      minLength: 9,
      maxLength: 9,
    },
    referralCode: {
      type: 'uid',
      unique: true,
      required: true,
      minLength: 9,
      maxLength: 9,
    },
    invitedBy: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'invitees',
    },
    invitees: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'plugin::users-permissions.user',
      mappedBy: 'invitedBy',
    },
    totalInviteEarningUSDT: {
      type: 'decimal',
      default: 0,
      min: 0,
    },
    totalStaticEarningUSDT: {
      type: 'decimal',
      default: 0,
      min: 0,
    },
    walletBalanceUSDT: {
      type: 'decimal',
      default: 0,
      min: 0,
    },
    lotterySpinQuota: {
      type: 'integer',
      default: 0,
      min: 0,
    },
    // 关系字段
    subscription_orders: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::subscription-order.subscription-order',
      mappedBy: 'user',
    },
    wallet_balance: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::wallet-balance.wallet-balance',
      mappedBy: 'user',
    },
    wallet_txs: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::wallet-tx.wallet-tx',
      mappedBy: 'user',
    },
    usdt_withdraws: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::usdt-withdraw.usdt-withdraw',
      mappedBy: 'user',
    },
    referral_rewards: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::referral-reward.referral-reward',
      mappedBy: 'referrer',
    },
    from_referral_rewards: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::referral-reward.referral-reward',
      mappedBy: 'fromUser',
    },
  },
}; 