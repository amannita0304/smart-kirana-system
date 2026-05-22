const mongoose = require('mongoose');

const TRANSACTION_TYPES = ['credit', 'payment'];
const PAYMENT_METHODS = ['cash', 'upi', 'bank', 'card', 'other'];

/**
 * Audit trail for all udhaar credits and payments.
 */
const paymentHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    udhaar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Udhaar',
      default: null,
    },
    type: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: 'cash',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    balanceBefore: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceAfter: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

paymentHistorySchema.index({ user: 1, customer: 1, createdAt: -1 });

module.exports = mongoose.model('PaymentHistory', paymentHistorySchema);
module.exports.TRANSACTION_TYPES = TRANSACTION_TYPES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
