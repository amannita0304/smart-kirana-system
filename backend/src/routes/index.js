const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const customerRoutes = require('./customer.routes');
const productRoutes = require('./product.routes');
const saleRoutes = require('./sale.routes');
const udhaarRoutes = require('./udhaar.routes');
const supplierRoutes = require('./supplier.routes');
const purchaseRoutes = require('./purchase.routes');
const dashboardRoutes = require('./dashboard.routes');
const reportRoutes = require('./report.routes');
const notificationRoutes = require('./notification.routes');

const router = express.Router();

// Public routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Protected business routes
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/udhaar', udhaarRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
