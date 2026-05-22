const Sale = require('../models/Sale');
const Udhaar = require('../models/Udhaar');
const Customer = require('../models/Customer');
const { sendSuccess } = require('../utils/apiResponse');
const { getDateRange } = require('../utils/dateRange');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route   GET /api/reports/sales
 */
const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = getDateRange(req.query);

  const [summary, sales] = await Promise.all([
    Sale.aggregate([
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
          totalGst: { $sum: '$gstAmount' },
          invoiceCount: { $sum: 1 },
        },
      },
    ]),
    Sale.find({
      user: req.user._id,
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 }),
  ]);

  sendSuccess(res, {
    reportType: 'sales',
    period: { startDate, endDate },
    summary: summary[0] || { totalSales: 0, totalProfit: 0, totalGst: 0, invoiceCount: 0 },
    sales,
  });
});

/**
 * @route   GET /api/reports/profit
 */
const getProfitReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = getDateRange(req.query);

  const profitByDay = await Sale.aggregate([
    {
      $match: {
        user: req.user._id,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        sales: { $sum: '$totalAmount' },
        profit: { $sum: '$totalProfit' },
        cost: { $sum: '$totalCost' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totals = profitByDay.reduce(
    (acc, day) => ({
      totalSales: acc.totalSales + day.sales,
      totalProfit: acc.totalProfit + day.profit,
      totalCost: acc.totalCost + day.cost,
    }),
    { totalSales: 0, totalProfit: 0, totalCost: 0 }
  );

  sendSuccess(res, {
    reportType: 'profit',
    period: { startDate, endDate },
    totals,
    profitByDay,
  });
});

/**
 * @route   GET /api/reports/udhaar
 */
const getUdhaarReport = asyncHandler(async (req, res) => {
  const [pendingEntries, customersWithBalance] = await Promise.all([
    Udhaar.find({
      user: req.user._id,
      status: { $in: ['unpaid', 'partial'] },
    })
      .populate('customer', 'name phone address pendingBalance')
      .sort({ pendingAmount: -1 }),

    Customer.find({
      user: req.user._id,
      pendingBalance: { $gt: 0 },
      isActive: true,
    }).sort({ pendingBalance: -1 }),
  ]);

  const totalPending = customersWithBalance.reduce((sum, c) => sum + c.pendingBalance, 0);

  sendSuccess(res, {
    reportType: 'udhaar',
    totalPending,
    customerCount: customersWithBalance.length,
    pendingEntries,
    customersWithBalance,
  });
});

module.exports = { getSalesReport, getProfitReport, getUdhaarReport };
