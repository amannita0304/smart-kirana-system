const mongoose = require('mongoose');

const UDHAAR_STATUS = ['paid', 'unpaid', 'partial'];

/**
 * Credit (udhaar) entry linked to a customer.
 */
const udhaarSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Udhaar amount is required'],
      min: 0.01,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: UDHAAR_STATUS,
      default: 'unpaid',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-calculate pending amount and status before save (Mongoose 9+ — no next())
udhaarSchema.pre('save', function updateUdhaarStatus() {
  this.pendingAmount = Math.max(0, this.amount - this.paidAmount);

  if (this.pendingAmount <= 0) {
    this.status = 'paid';
    this.paidAmount = this.amount;
    this.pendingAmount = 0;
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else {
    this.status = 'unpaid';
  }
});

module.exports = mongoose.model('Udhaar', udhaarSchema);
module.exports.UDHAAR_STATUS = UDHAAR_STATUS;
