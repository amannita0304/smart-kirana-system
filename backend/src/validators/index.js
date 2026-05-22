const { body, param, query } = require('express-validator');

// ─── Auth ───────────────────────────────────────────────────────────────────
const registerValidation = [
  body('shopName').trim().notEmpty().withMessage('Shop name is required'),
  body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Customer ───────────────────────────────────────────────────────────────
const customerValidation = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('address').optional().trim(),
];

const mongoIdParam = [param('id').isMongoId().withMessage('Invalid ID')];

// ─── Product ────────────────────────────────────────────────────────────────
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('buyingPrice').isFloat({ min: 0 }).withMessage('Valid buying price required'),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Valid selling price required'),
  body('stockQuantity').optional().isFloat({ min: 0 }),
  body('lowStockThreshold').optional().isFloat({ min: 0 }),
];

// ─── Sale ───────────────────────────────────────────────────────────────────
const saleValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.productId').isMongoId().withMessage('Valid product ID required'),
  body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Valid quantity required'),
  body('gstEnabled').optional().isBoolean(),
  body('gstPercent').optional().isFloat({ min: 0, max: 100 }),
  body('paymentMethod').optional().isIn(['cash', 'upi', 'card', 'udhaar', 'mixed']),
];

// ─── Udhaar ─────────────────────────────────────────────────────────────────
const udhaarValidation = [
  body('customerId').isMongoId().withMessage('Valid customer ID required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount required'),
];

const paymentValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid payment amount required'),
  body('paymentMethod').optional().isIn(['cash', 'upi', 'bank', 'card', 'other']),
];

// ─── Supplier ───────────────────────────────────────────────────────────────
const supplierValidation = [
  body('name').trim().notEmpty().withMessage('Supplier name is required'),
];

// ─── Purchase ───────────────────────────────────────────────────────────────
const purchaseValidation = [
  body('supplierId').isMongoId().withMessage('Please select a supplier'),
  body('items').isArray({ min: 1 }).withMessage('Add at least one item'),
  body('items.*.name').trim().notEmpty().withMessage('Item name is required'),
  body('items.*.quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  body('items.*.buyingPrice')
    .isFloat({ min: 0 })
    .withMessage('Buying price is required'),
  body('paidAmount').optional().isFloat({ min: 0 }).withMessage('Paid amount must be 0 or more'),
];

const periodQuery = [
  query('period').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']),
];

module.exports = {
  registerValidation,
  loginValidation,
  customerValidation,
  productValidation,
  saleValidation,
  udhaarValidation,
  paymentValidation,
  supplierValidation,
  purchaseValidation,
  mongoIdParam,
  periodQuery,
};
