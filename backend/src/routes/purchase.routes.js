const express = require('express');
const {
  createPurchase,
  recordPurchasePayment,
  getPurchases,
} = require('../controllers/purchase.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { purchaseValidation, paymentValidation, mongoIdParam } = require('../validators');

const router = express.Router();

router.use(protect);

router.route('/').get(getPurchases).post(validate(purchaseValidation), createPurchase);
router.post(
  '/:id/payment',
  validate([...mongoIdParam, ...paymentValidation]),
  recordPurchasePayment
);

module.exports = router;
