const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const Udhaar = require('../models/Udhaar');
const PaymentHistory = require('../models/PaymentHistory');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route   GET /api/customers
 * @desc    List customers with search and pagination
 */
const getCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id, isActive: true };

  if (req.query.search) {
    const search = req.query.search.trim();
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(filter),
  ]);

  sendPaginated(res, { data: customers, page, limit, total });
});

/**
 * @route   GET /api/customers/:id
 */
const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id });
  if (!customer) throw new AppError('Customer not found', 404);

  sendSuccess(res, { customer });
});

/**
 * @route   GET /api/customers/:id/history
 * @desc    Purchase + udhaar history for a customer
 */
const getCustomerHistory = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id });
  if (!customer) throw new AppError('Customer not found', 404);

  const [sales, udhaarEntries, payments] = await Promise.all([
    Sale.find({ user: req.user._id, customer: customer._id }).sort({ createdAt: -1 }).limit(50),
    Udhaar.find({ user: req.user._id, customer: customer._id }).sort({ createdAt: -1 }),
    PaymentHistory.find({ user: req.user._id, customer: customer._id }).sort({ createdAt: -1 }),
  ]);

  sendSuccess(res, { customer, sales, udhaarEntries, payments });
});

/**
 * @route   POST /api/customers
 */
const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create({ ...req.body, user: req.user._id });
  sendSuccess(res, { message: 'Customer added', customer }, 201);
});

/**
 * @route   PUT /api/customers/:id
 */
const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!customer) throw new AppError('Customer not found', 404);
  sendSuccess(res, { message: 'Customer updated', customer });
});

/**
 * @route   DELETE /api/customers/:id
 */
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isActive: false },
    { new: true }
  );

  if (!customer) throw new AppError('Customer not found', 404);
  sendSuccess(res, { message: 'Customer deleted' });
});

module.exports = {
  getCustomers,
  getCustomer,
  getCustomerHistory,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
