const mongoose = require('mongoose');

/**
 * Kirana customer — tracks contact info and pending udhaar balance.
 */
const customerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    pendingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

customerSchema.index({ user: 1, phone: 1 });
customerSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('Customer', customerSchema);
