const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const { generatePurchaseInvoiceNumber } = require('../utils/invoiceNumber');
const asyncHandler = require('../middleware/asyncHandler');
const withTransaction = require('../utils/withTransaction');

/**
 * @route   POST /api/purchases
 * @desc    Record purchase — increases stock, tracks supplier payment
 */
const createPurchase = asyncHandler(async (req, res) => {
  const { supplierId, items, paidAmount = 0, notes = '' } = req.body;

  const supplier = await Supplier.findOne({ _id: supplierId, user: req.user._id });
  if (!supplier) throw new AppError('Supplier not found', 404);

  const createdPurchase = await withTransaction(async (session) => {
    const sessionOpt = session ? { session } : {};
    let totalAmount = 0;
    const purchaseItems = [];

    for (const item of items) {
      const lineTotal = item.buyingPrice * item.quantity;
      totalAmount += lineTotal;

      purchaseItems.push({
        product: item.productId || null,
        name: item.name,
        quantity: item.quantity,
        buyingPrice: item.buyingPrice,
        lineTotal,
      });

      if (item.productId) {
        const product = await Product.findOne({
          _id: item.productId,
          user: req.user._id,
        });

        if (product) {
          product.stockQuantity += item.quantity;
          product.buyingPrice = item.buyingPrice;
          await product.save(sessionOpt);
        }
      }
    }

    const purchasePayload = {
      user: req.user._id,
      supplier: supplierId,
      invoiceNumber: generatePurchaseInvoiceNumber(),
      items: purchaseItems,
      totalAmount,
      paidAmount,
      notes,
    };

    const purchase = session
      ? (await Purchase.create([purchasePayload], { session }))[0]
      : await Purchase.create(purchasePayload);

    supplier.pendingBalance += purchase.pendingAmount;
    await supplier.save(sessionOpt);

    return purchase;
  });

  sendSuccess(res, { message: 'Purchase recorded', purchase: createdPurchase }, 201);
});

/**
 * @route   POST /api/purchases/:id/payment
 */
const recordPurchasePayment = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const purchase = await Purchase.findOne({ _id: req.params.id, user: req.user._id });
  if (!purchase) throw new AppError('Purchase not found', 404);

  if (purchase.paymentStatus === 'paid') {
    throw new AppError('Purchase already fully paid', 400);
  }

  if (amount > purchase.pendingAmount) {
    throw new AppError(`Payment exceeds pending ₹${purchase.pendingAmount}`, 400);
  }

  purchase.paidAmount += amount;
  await purchase.save();

  const supplier = await Supplier.findById(purchase.supplier);
  supplier.pendingBalance = Math.max(0, supplier.pendingBalance - amount);
  await supplier.save();

  sendSuccess(res, { message: 'Supplier payment recorded', purchase, supplier });
});

/**
 * @route   GET /api/purchases
 */
const getPurchases = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };

  const [purchases, total] = await Promise.all([
    Purchase.find(filter)
      .populate('supplier', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Purchase.countDocuments(filter),
  ]);

  sendPaginated(res, { data: purchases, page, limit, total });
});

module.exports = { createPurchase, recordPurchasePayment, getPurchases };
