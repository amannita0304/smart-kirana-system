const express = require('express');
const {
  createSale,
  getSales,
  getSale,
  getDailySalesSummary,
} = require('../controllers/sale.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { saleValidation, mongoIdParam, periodQuery } = require('../validators');

const router = express.Router();

router.use(protect);

router.post('/', validate(saleValidation), createSale);
router.get('/daily/summary', validate(periodQuery), getDailySalesSummary);
router.get('/', validate(periodQuery), getSales);
router.get('/:id', validate(mongoIdParam), getSale);

module.exports = router;
