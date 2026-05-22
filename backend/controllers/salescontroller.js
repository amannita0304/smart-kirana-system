const Product = require('../models/product');
const Sale = require('../models/sale'); // Let’s assume you have a Mongoose Sale model, or else define a temporary schema below

/**
 * Sale Model Fallback (if ../models/sale.js does not exist)
 * Uncomment and adjust as needed.
 *
const mongoose = require('mongoose');
const saleSchema = new mongoose.Schema({
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    buyingPrice: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  totalProfit: { type: Number, required: true },
  user: { type: String }, // You can link to user if you track cashier
  createdAt: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', saleSchema);
*/

// POST /api/sales - Create a new sale (accept sold items, reduce stock, etc.)
exports.createSale = async (req, res) => {
  try {
    const { items } = req.body; // items: [{ productId, quantity }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for sale.' });
    }

    // Aggregate info for calculating total and profit, and for updating products
    let totalAmount = 0;
    let totalProfit = 0;
    const saleItems = [];

    // First: Check availability and collect product info
    for (const { productId, quantity } of items) {
      if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Each item must have valid productId and positive quantity.' });
      }
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${productId}` });
      }
      if (product.stockQuantity < quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${quantity}` });
      }
      // Record for sale
      const itemAmount = product.sellingPrice * quantity;
      const itemProfit = (product.sellingPrice - product.buyingPrice) * quantity;

      saleItems.push({
        productId: product._id,
        quantity,
        sellingPrice: product.sellingPrice,
        buyingPrice: product.buyingPrice,
        name: product.name,
        category: product.category
      });

      totalAmount += itemAmount;
      totalProfit += itemProfit;
    }

    // Second: Reduce stock in all relevant products (as transaction if possible)
    // Optionally: Use session/transaction for rollback safety if running MongoDB with replica set
    for (const { productId, quantity } of items) {
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { stockQuantity: -quantity } },
        { new: true }
      );
    }

    // Third: Store transaction history
    const sale = new Sale({
      items: saleItems,
      totalAmount,
      totalProfit
      // Optionally add user/cashier, e.g. user: req.user?.id
    });
    await sale.save();

    res.status(201).json({
      message: 'Sale completed successfully',
      sale: {
        _id: sale._id,
        items: sale.items,
        totalAmount: sale.totalAmount,
        totalProfit: sale.totalProfit,
        createdAt: sale.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Sale failed', error: error.message });
  }
};

// Optionally: Add a GET /api/sales to fetch transaction history
exports.getSalesHistory = async (req, res) => {
  try {
    const sales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(100) // Limit last 100 transactions
      .populate('items.productId', 'name category barcode');

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve sales history', error: error.message });
  }
};