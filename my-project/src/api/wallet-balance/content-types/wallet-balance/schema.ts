export default {
  kind: 'collectionType',
  collectionName: 'wallet_balances',
  info: {
    singularName: 'wallet-balance',
    pluralName: 'wallet-balances',
    displayName: 'Wallet Balance',
    description: '',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    user: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'walletBalance',
      onDelete: 'cascade',
    },
    usdtBalance: {
      type: 'decimal',
      columnType: 'numeric',
      scale: 8,
      precision: 36,
      default: 0,
      required: true,
    },
    aiTokenBalance: {
      type: 'decimal',
      columnType: 'numeric',
      scale: 8,
      precision: 36,
      default: 0,
      required: true,
    },
  },
}; 