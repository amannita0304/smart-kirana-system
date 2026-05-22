const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route   GET /api/products
 */
const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id, isActive: true };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    const search = req.query.search.trim();
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { barcode: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }
  if (req.query.stockStatus === 'low_stock') {
    filter.$expr = { $lte: ['$stockQuantity', '$lowStockThreshold'] };
    filter.stockQuantity = { $gt: 0 };
  }
  if (req.query.stockStatus === 'out_of_stock') {
    filter.stockQuantity = 0;
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  sendPaginated(res, { data: products, page, limit, total });
});

/**
 * @route   GET /api/products/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', {
    user: req.user._id,
    isActive: true,
  });

  sendSuccess(res, { categories });
});

/**
 * @route   GET /api/products/low-stock
 */
const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    user: req.user._id,
    isActive: true,
    $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
  }).sort({ stockQuantity: 1 });

  sendSuccess(res, { products, count: products.length });
});

/**
 * @route   GET /api/products/:id
 */
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, user: req.user._id });
  if (!product) throw new AppError('Product not found', 404);
  sendSuccess(res, { product });
});

/**
 * @route   POST /api/products
 */
const createProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body, user: req.user._id };

  if (req.file) {
    productData.image = `/uploads/products/${req.file.filename}`;
  }

  const product = await Product.create(productData);
  sendSuccess(res, { message: 'Product added', product }, 201);
});

/**
 * @route   PUT /api/products/:id
 */
const updateProduct = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  if (req.file) {
    updates.image = `/uploads/products/${req.file.filename}`;
  }

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!product) throw new AppError('Product not found', 404);
  sendSuccess(res, { message: 'Product updated', product });
});

/**
 * @route   DELETE /api/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isActive: false },
    { new: true }
  );

  if (!product) throw new AppError('Product not found', 404);
  sendSuccess(res, { message: 'Product deleted' });
});

module.exports = {
  getProducts,
  getCategories,
  getLowStockProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
