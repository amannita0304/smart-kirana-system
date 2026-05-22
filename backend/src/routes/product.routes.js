const express = require('express');
const {
  getProducts,
  getCategories,
  getLowStockProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { uploadProductImage } = require('../middleware/upload.middleware');
const { productValidation, mongoIdParam } = require('../validators');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Multer wrapper for async error handling
const handleUpload = asyncHandler(async (req, res, next) => {
  uploadProductImage(req, res, (err) => {
    if (err) return next(err);
    next();
  });
});

router.use(protect);

router.get('/categories/list', getCategories);
router.get('/low-stock/alerts', getLowStockProducts);

router.route('/').get(getProducts).post(handleUpload, validate(productValidation), createProduct);

router
  .route('/:id')
  .get(validate(mongoIdParam), getProduct)
  .put(validate(mongoIdParam), handleUpload, updateProduct)
  .delete(validate(mongoIdParam), deleteProduct);

module.exports = router;
