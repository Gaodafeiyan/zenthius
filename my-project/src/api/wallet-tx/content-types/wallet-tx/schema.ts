export default {
  kind: 'collectionType',
  collectionName: 'wallet_txs',
  info: {
    singularName: 'wallet-tx',
    pluralName: 'wallet-txs',
    displayName: 'Wallet Transaction',
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
      inversedBy: 'walletTransactions',
      onDelete: 'cascade',
    },
    txType: {
      type: 'enumeration',
      enum: ['subscription', 'referral', 'redeem', 'withdraw', 'deposit'],
      required: true,
    },
    direction: {
      type: 'enumeration',
      enum: ['in', 'out'],
      required: true,
    },
    amount: {
      type: 'decimal',
      columnType: 'numeric',
      scale: 8,
      precision: 36,
      required: true,
    },
    asset: {
      type: 'enumeration',
      enum: ['USDT', 'AIToken'],
      required: true,
    },
    txHash: {
      type: 'string',
      required: false,
    },
    status: {
      type: 'enumeration',
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
      required: true,
    },
  },
}; 