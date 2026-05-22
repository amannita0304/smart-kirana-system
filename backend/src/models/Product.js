const mongoose = require('mongoose');

const UNITS = ['piece', 'kg', 'liter', 'pack', 'dozen'];
const STOCK_STATUS = ['in_stock', 'low_stock', 'out_of_stock'];

/**
 * Inventory product with buying/selling price and stock tracking.
 */
const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: 60,
    },
    barcode: {
      type: String,
      trim: true,
      default: '',
    },
    buyingPrice: {
      type: Number,
      required: [true, 'Buying price is required'],
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 5,
    },
    unit: {
      type: String,
      enum: UNITS,
      default: 'piece',
    },
    image: {
      type: String,
      default: '',
    },
    supplierName: {
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

// Virtual: stock status for UI alerts
productSchema.virtual('stockStatus').get(function getStockStatus() {
  if (this.stockQuantity <= 0) return 'out_of_stock';
  if (this.stockQuantity <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.index({ user: 1, barcode: 1 }, { sparse: true });
productSchema.index({ user: 1, category: 1 });
productSchema.index({ user: 1, name: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
module.exports.UNITS = UNITS;
module.exports.STOCK_STATUS = STOCK_STATUS;
