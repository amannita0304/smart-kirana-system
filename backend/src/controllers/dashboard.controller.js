const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Udhaar = require('../models/Udhaar');
const { sendSuccess } = require('../utils/apiResponse');
const { getDateRange } = require('../utils/dateRange');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route   GET /api/dashboard
 * @desc    Main dashboard stats for shopkeeper
 */
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate } = getDateRange({ period: req.query.period || 'daily' });

  const [
    salesStats,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    pendingUdhaar,
    salesTrend,
    topProducts,
    topCustomers,
  ] = await Promise.all([
    // Sales & profit for period
    Sale.aggregate([
      {
        $match: {
          user: userId,
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
    ]),

    Customer.countDocuments({ user: userId, isActive: true }),

    Product.countDocuments({ user: userId, isActive: true }),

    Product.find({
      user: userId,
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
    })
      .select('name stockQuantity lowStockThreshold category stockStatus')
      .limit(10),

    Udhaar.aggregate([
      { $match: { user: userId, status: { $in: ['unpaid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$pendingAmount' }, count: { $sum: 1 } } },
    ]),

    // Sales trend — last 7 days
    Sale.aggregate([
      {
        $match: {
          user: userId,
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          profit: { $sum: '$totalProfit' },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Most sold products
    Sale.aggregate([
      { $match: { user: userId, createdAt: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]),

    // Best customers by purchase amount
    Sale.aggregate([
      {
        $match: {
          user: userId,
          customer: { $ne: null },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$customer',
          customerName: { $first: '$customerName' },
          totalSpent: { $sum: '$totalAmount' },
          visits: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
    ]),
  ]);

  sendSuccess(res, {
    stats: {
      totalSales: salesStats[0]?.totalSales || 0,
      totalProfit: salesStats[0]?.totalProfit || 0,
      invoiceCount: salesStats[0]?.invoiceCount || 0,
      totalCustomers,
      totalProducts,
      pendingUdhaar: pendingUdhaar[0]?.total || 0,
      pendingUdhaarCount: pendingUdhaar[0]?.count || 0,
    },
    lowStockProducts,
    salesTrend,
    topProducts,
    topCustomers,
    period: { startDate, endDate, label: req.query.period || 'daily' },
  });
});

module.exports = { getDashboard };
