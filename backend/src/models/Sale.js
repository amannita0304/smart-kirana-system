const mongoose = require('mongoose');

const PAYMENT_METHODS = ['cash', 'upi', 'card', 'udhaar', 'mixed'];
const PAYMENT_STATUS = ['paid', 'partial', 'pending'];

/**
 * Sales invoice with line items, GST, and profit calculation.
 */
const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    category: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 0.01 },
    buyingPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    lineProfit: { type: Number, required: true },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    customerName: {
      type: String,
      trim: true,
      default: 'Walk-in Customer',
    },
    items: {
      type: [saleItemSchema],
      validate: [(v) => v.length > 0, 'Sale must have at least one item'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    gstEnabled: { type: Boolean, default: false },
    gstPercent: { type: Number, default: 0, min: 0, max: 100 },
    gstAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    totalProfit: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: 'paid',
    },
    udhaar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Udhaar',
      default: null,
    },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

saleSchema.index({ user: 1, invoiceNumber: 1 }, { unique: true });
saleSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Sale', saleSchema);
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
module.exports.PAYMENT_STATUS = PAYMENT_STATUS;
