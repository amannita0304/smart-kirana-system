const express = require('express');
const { getDashboard } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { periodQuery } = require('../validators');

const router = express.Router();

router.use(protect);
router.get('/', validate(periodQuery), getDashboard);

module.exports = router;
