const express = require('express');
const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierPurchases,
} = require('../controllers/supplier.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { supplierValidation, mongoIdParam } = require('../validators');

const router = express.Router();

router.use(protect);

router.route('/').get(getSuppliers).post(validate(supplierValidation), createSupplier);

router.get('/:id/purchases', validate(mongoIdParam), getSupplierPurchases);

router
  .route('/:id')
  .put(validate([...mongoIdParam, ...supplierValidation]), updateSupplier)
  .delete(validate(mongoIdParam), deleteSupplier);

module.exports = router;
