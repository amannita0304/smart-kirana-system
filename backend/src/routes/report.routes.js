const express = require('express');
const {
  getSalesReport,
  getProfitReport,
  getUdhaarReport,
} = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { periodQuery } = require('../validators');

const router = express.Router();

router.use(protect);

router.get('/sales', validate(periodQuery), getSalesReport);
router.get('/profit', validate(periodQuery), getProfitReport);
router.get('/udhaar', getUdhaarReport);

module.exports = router;
