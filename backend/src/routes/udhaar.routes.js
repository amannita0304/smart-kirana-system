const express = require('express');
const {
  getUdhaarList,
  addUdhaar,
  recordPayment,
  getUdhaarHistory,
  getPendingSummary,
} = require('../controllers/udhaar.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { udhaarValidation, paymentValidation, mongoIdParam } = require('../validators');

const router = express.Router();

router.use(protect);

router.get('/pending/summary', getPendingSummary);
router.route('/').get(getUdhaarList).post(validate(udhaarValidation), addUdhaar);
router.post('/:id/payment', validate([...mongoIdParam, ...paymentValidation]), recordPayment);
router.get('/:id/history', validate(mongoIdParam), getUdhaarHistory);

module.exports = router;
