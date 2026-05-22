const Udhaar = require('../models/Udhaar');
const Customer = require('../models/Customer');
const PaymentHistory = require('../models/PaymentHistory');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route   GET /api/udhaar
 */
const getUdhaarList = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };

  if (req.query.status) filter.status = req.query.status;
  if (req.query.customerId) filter.customer = req.query.customerId;

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const [udhaarList, total] = await Promise.all([
    Udhaar.find(filter)
      .populate('customer', 'name phone pendingBalance')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Udhaar.countDocuments(filter),
  ]);

  sendPaginated(res, { data: udhaarList, page, limit, total });
});

/**
 * @route   POST /api/udhaar
 * @desc    Add new udhaar (credit) entry
 */
const addUdhaar = asyncHandler(async (req, res) => {
  const { customerId, amount, description, dueDate } = req.body;

  const customer = await Customer.findOne({ _id: customerId, user: req.user._id });
  if (!customer) throw new AppError('Customer not found', 404);

  const balanceBefore = customer.pendingBalance;

  const udhaar = await Udhaar.create({
    user: req.user._id,
    customer: customerId,
    amount,
    description: description || 'Udhaar entry',
    dueDate: dueDate || null,
  });

  customer.pendingBalance += amount;
  await customer.save();

  await PaymentHistory.create({
    user: req.user._id,
    customer: customerId,
    udhaar: udhaar._id,
    type: 'credit',
    amount,
    notes: description || 'Manual udhaar entry',
    balanceBefore,
    balanceAfter: customer.pendingBalance,
  });

  sendSuccess(res, { message: 'Udhaar added', udhaar, customer }, 201);
});

/**
 * @route   POST /api/udhaar/:id/payment
 * @desc    Record partial or full payment against udhaar
 */
const recordPayment = asyncHandler(async (req, res) => {
  const { amount, paymentMethod = 'cash', notes = '' } = req.body;

  const udhaar = await Udhaar.findOne({ _id: req.params.id, user: req.user._id });
  if (!udhaar) throw new AppError('Udhaar entry not found', 404);

  if (udhaar.status === 'paid') {
    throw new AppError('This udhaar is already fully paid', 400);
  }

  if (amount > udhaar.pendingAmount) {
    throw new AppError(`Payment exceeds pending amount of ₹${udhaar.pendingAmount}`, 400);
  }

  const customer = await Customer.findById(udhaar.customer);
  const balanceBefore = customer.pendingBalance;

  udhaar.paidAmount += amount;
  await udhaar.save();

  customer.pendingBalance = Math.max(0, customer.pendingBalance - amount);
  await customer.save();

  const payment = await PaymentHistory.create({
    user: req.user._id,
    customer: customer._id,
    udhaar: udhaar._id,
    type: 'payment',
    amount,
    paymentMethod,
    notes: notes || 'Udhaar payment received',
    balanceBefore,
    balanceAfter: customer.pendingBalance,
  });

  sendSuccess(res, {
    message: 'Payment recorded',
    udhaar,
    payment,
    customer: { id: customer._id, pendingBalance: customer.pendingBalance },
  });
});

/**
 * @route   GET /api/udhaar/:id/history
 */
const getUdhaarHistory = asyncHandler(async (req, res) => {
  const udhaar = await Udhaar.findOne({ _id: req.params.id, user: req.user._id }).populate(
    'customer',
    'name phone'
  );

  if (!udhaar) throw new AppError('Udhaar entry not found', 404);

  const payments = await PaymentHistory.find({ udhaar: udhaar._id }).sort({ createdAt: -1 });

  sendSuccess(res, { udhaar, payments });
});

/**
 * @route   GET /api/udhaar/pending/summary
 */
const getPendingSummary = asyncHandler(async (req, res) => {
  const summary = await Udhaar.aggregate([
    { $match: { user: req.user._id, status: { $in: ['unpaid', 'partial'] } } },
    {
      $group: {
        _id: null,
        totalPending: { $sum: '$pendingAmount' },
        count: { $sum: 1 },
      },
    },
  ]);

  sendSuccess(res, {
    summary: summary[0] || { totalPending: 0, count: 0 },
  });
});

module.exports = {
  getUdhaarList,
  addUdhaar,
  recordPayment,
  getUdhaarHistory,
  getPendingSummary,
};
