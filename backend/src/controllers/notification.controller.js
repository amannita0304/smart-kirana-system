const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Udhaar = require('../models/Udhaar');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route   GET /api/notifications
 * @desc    Low stock alerts + pending payment reminders
 */
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [lowStock, outOfStock, pendingUdhaar, overdueCustomers] = await Promise.all([
    Product.find({
      user: userId,
      isActive: true,
      stockQuantity: { $gt: 0 },
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
    })
      .select('name stockQuantity lowStockThreshold category')
      .limit(20),

    Product.find({
      user: userId,
      isActive: true,
      stockQuantity: 0,
    })
      .select('name category')
      .limit(20),

    Udhaar.find({
      user: userId,
      status: { $in: ['unpaid', 'partial'] },
    })
      .populate('customer', 'name phone')
      .sort({ pendingAmount: -1 })
      .limit(20),

    Customer.find({
      user: userId,
      pendingBalance: { $gt: 0 },
      isActive: true,
    })
      .select('name phone pendingBalance')
      .sort({ pendingBalance: -1 })
      .limit(20),
  ]);

  const notifications = [
    ...lowStock.map((p) => ({
      type: 'low_stock',
      priority: 'medium',
      message: `${p.name} — Low stock (${p.stockQuantity} left)`,
      messageHi: `${p.name} — कम स्टॉक (${p.stockQuantity} बचे)`,
      data: p,
    })),
    ...outOfStock.map((p) => ({
      type: 'out_of_stock',
      priority: 'high',
      message: `${p.name} — Out of stock`,
      messageHi: `${p.name} — स्टॉक खत्म`,
      data: p,
    })),
    ...pendingUdhaar.map((u) => ({
      type: 'pending_udhaar',
      priority: 'high',
      message: `${u.customer?.name} — ₹${u.pendingAmount} pending`,
      messageHi: `${u.customer?.name} — ₹${u.pendingAmount} बकाया`,
      data: u,
    })),
  ];

  sendSuccess(res, {
    count: notifications.length,
    notifications,
    summary: {
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      pendingUdhaarCount: pendingUdhaar.length,
      customersWithBalance: overdueCustomers.length,
    },
  });
});

module.exports = { getNotifications };
