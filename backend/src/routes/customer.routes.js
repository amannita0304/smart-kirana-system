const express = require('express');
const {
  getCustomers,
  getCustomer,
  getCustomerHistory,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { customerValidation, mongoIdParam } = require('../validators');

const router = express.Router();

router.use(protect);

router.route('/').get(getCustomers).post(validate(customerValidation), createCustomer);

// Specific routes before /:id to avoid route conflicts
router.get('/:id/history', validate(mongoIdParam), getCustomerHistory);

router
  .route('/:id')
  .get(validate(mongoIdParam), getCustomer)
  .put(validate([...mongoIdParam, ...customerValidation]), updateCustomer)
  .delete(validate(mongoIdParam), deleteCustomer);

module.exports = router;
