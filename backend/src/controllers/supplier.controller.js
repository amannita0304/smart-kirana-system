const Supplier = require('../models/Supplier');
const Purchase = require('../models/Purchase');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route   GET /api/suppliers
 */
const getSuppliers = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id, isActive: true };

  if (req.query.search) {
    filter.name = { $regex: req.query.search.trim(), $options: 'i' };
  }

  const suppliers = await Supplier.find(filter).sort({ name: 1 });
  sendSuccess(res, { suppliers, count: suppliers.length });
});

/**
 * @route   POST /api/suppliers
 */
const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create({ ...req.body, user: req.user._id });
  sendSuccess(res, { message: 'Supplier added', supplier }, 201);
});

/**
 * @route   PUT /api/suppliers/:id
 */
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!supplier) throw new AppError('Supplier not found', 404);
  sendSuccess(res, { message: 'Supplier updated', supplier });
});

/**
 * @route   DELETE /api/suppliers/:id
 */
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isActive: false },
    { new: true }
  );

  if (!supplier) throw new AppError('Supplier not found', 404);
  sendSuccess(res, { message: 'Supplier deleted' });
});

/**
 * @route   GET /api/suppliers/:id/purchases
 */
const getSupplierPurchases = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ _id: req.params.id, user: req.user._id });
  if (!supplier) throw new AppError('Supplier not found', 404);

  const purchases = await Purchase.find({ supplier: supplier._id, user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  sendSuccess(res, { supplier, purchases });
});

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierPurchases,
};
