export default {
  kind: 'collectionType',
  collectionName: 'usdt_withdraws',
  info: {
    singularName: 'usdt-withdraw',
    pluralName: 'usdt-withdraws',
    displayName: 'USDT Withdraw',
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
      inversedBy: 'usdtWithdrawals',
      onDelete: 'cascade',
    },
    amountUSDT: {
      type: 'decimal',
      columnType: 'numeric',
      scale: 8,
      precision: 36,
      required: true,
    },
    toAddress: {
      type: 'string',
      required: true,
    },
    status: {
      type: 'enumeration',
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
      required: true,
    },
    txHash: {
      type: 'string',
      required: false,
    },
  },
}; 