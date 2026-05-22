const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Udhaar = require('../models/Udhaar');
const PaymentHistory = require('../models/PaymentHistory');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const { generateInvoiceNumber } = require('../utils/invoiceNumber');
const { getDateRange } = require('../utils/dateRange');
const asyncHandler = require('../middleware/asyncHandler');
const withTransaction = require('../utils/withTransaction');

/**
 * @route   POST /api/sales
 * @desc    Create sale — deducts stock, calculates profit, optional GST & udhaar
 */
const createSale = asyncHandler(async (req, res) => {
  const {
    items,
    customerId,
    customerName,
    gstEnabled = false,
    gstPercent = 0,
    paymentMethod = 'cash',
    notes = '',
  } = req.body;

  const result = await withTransaction(async (session) => {
    const sessionOpt = session ? { session } : {};
    let subtotal = 0;
    let totalCost = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        user: req.user._id,
        isActive: true,
      }).session(session || null);

      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 404);
      }

      if (product.stockQuantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`,
          400
        );
      }

      const lineTotal = product.sellingPrice * item.quantity;
      const lineCost = product.buyingPrice * item.quantity;
      const lineProfit = lineTotal - lineCost;

      saleItems.push({
        product: product._id,
        name: product.name,
        category: product.category,
        quantity: item.quantity,
        buyingPrice: product.buyingPrice,
        sellingPrice: product.sellingPrice,
        lineTotal,
        lineProfit,
      });

      subtotal += lineTotal;
      totalCost += lineCost;

      // Deduct stock
      product.stockQuantity -= item.quantity;
      await product.save(sessionOpt);
    }

    const gstAmount = gstEnabled ? (subtotal * gstPercent) / 100 : 0;
    const totalAmount = subtotal + gstAmount;
    const actualProfit = subtotal - totalCost;

    let customer = null;
    let paymentStatus = 'paid';
    let udhaarRecord = null;

    if (customerId) {
      customer = await Customer.findOne({ _id: customerId, user: req.user._id });
      if (!customer) throw new AppError('Customer not found', 404);
    }

    // Handle udhaar payment
    if (paymentMethod === 'udhaar') {
      if (!customer) throw new AppError('Customer required for udhaar sales', 400);
      paymentStatus = 'pending';
    }

    const salePayload = {
      user: req.user._id,
      invoiceNumber: generateInvoiceNumber(),
      customer: customer?._id || null,
      customerName: customer?.name || customerName || 'Walk-in Customer',
      items: saleItems,
      subtotal,
      gstEnabled,
      gstPercent: gstEnabled ? gstPercent : 0,
      gstAmount,
      totalAmount,
      totalCost,
      totalProfit: actualProfit,
      paymentMethod,
      paymentStatus,
      notes,
    };

    const createdSale = session
      ? (await Sale.create([salePayload], { session }))[0]
      : await Sale.create(salePayload);

    // Create udhaar entry if payment is on credit
    if (paymentMethod === 'udhaar' && customer) {
      const balanceBefore = customer.pendingBalance;

      const udhaarPayload = {
        user: req.user._id,
        customer: customer._id,
        amount: totalAmount,
        description: `Sale invoice ${createdSale.invoiceNumber}`,
        sale: createdSale._id,
      };

      udhaarRecord = session
        ? (await Udhaar.create([udhaarPayload], { session }))[0]
        : await Udhaar.create(udhaarPayload);

      customer.pendingBalance += totalAmount;
      customer.totalPurchases += totalAmount;
      await customer.save(sessionOpt);

      const paymentPayload = {
        user: req.user._id,
        customer: customer._id,
        udhaar: udhaarRecord._id,
        type: 'credit',
        amount: totalAmount,
        notes: `Udhaar from sale ${createdSale.invoiceNumber}`,
        balanceBefore,
        balanceAfter: customer.pendingBalance,
      };

      if (session) {
        await PaymentHistory.create([paymentPayload], { session });
      } else {
        await PaymentHistory.create(paymentPayload);
      }

      createdSale.udhaar = udhaarRecord._id;
      await createdSale.save(sessionOpt);
    } else if (customer) {
      customer.totalPurchases += totalAmount;
      await customer.save(sessionOpt);
    }

    return { createdSale, udhaarRecord };
  });

  sendSuccess(
    res,
    {
      message: 'Sale completed successfully',
      sale: result.createdSale,
      udhaar: result.udhaarRecord || null,
    },
    201
  );
});

/**
 * @route   GET /api/sales
 */
const getSales = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };

  if (req.query.period || req.query.startDate) {
    const { startDate, endDate } = getDateRange(req.query);
    filter.createdAt = { $gte: startDate, $lte: endDate };
  }

  const [sales, total] = await Promise.all([
    Sale.find(filter)
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Sale.countDocuments(filter),
  ]);

  sendPaginated(res, { data: sales, page, limit, total });
});

/**
 * @route   GET /api/sales/:id
 */
const getSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ _id: req.params.id, user: req.user._id }).populate(
    'customer',
    'name phone address'
  );

  if (!sale) throw new AppError('Sale not found', 404);
  sendSuccess(res, { sale });
});

/**
 * @route   GET /api/sales/daily/summary
 */
const getDailySalesSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = getDateRange({ period: 'daily' });

  const summary = await Sale.aggregate([
    {
      $match: {
        user: req.user._id,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        totalProfit: { $sum: '$totalProfit' },
        invoiceCount: { $sum: 1 },
      },
    },
  ]);

  sendSuccess(res, {
    summary: summary[0] || { totalSales: 0, totalProfit: 0, invoiceCount: 0 },
    period: { startDate, endDate },
  });
});

module.exports = { createSale, getSales, getSale, getDailySalesSummary };
