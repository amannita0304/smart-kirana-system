const mongoose = require('mongoose');

const PAYMENT_STATUS = ['paid', 'partial', 'pending'];

const purchaseItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0.01 },
    buyingPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

/**
 * Stock purchase from supplier — increases inventory on record.
 */
const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    items: {
      type: [purchaseItemSchema],
      validate: [(v) => v.length > 0, 'Purchase must have at least one item'],
    },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    pendingAmount: { type: Number, default: 0, min: 0 },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: 'pending',
    },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

purchaseSchema.pre('save', function updatePurchaseStatus() {
  this.pendingAmount = Math.max(0, this.totalAmount - this.paidAmount);

  if (this.pendingAmount <= 0) {
    this.paymentStatus = 'paid';
    this.paidAmount = this.totalAmount;
    this.pendingAmount = 0;
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'pending';
  }
});

purchaseSchema.index({ user: 1, invoiceNumber: 1 }, { unique: true });
purchaseSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
module.exports.PAYMENT_STATUS = PAYMENT_STATUS;
