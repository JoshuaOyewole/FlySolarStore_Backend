const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrder,
  getUserOrders,
  getMyOrders,
  updateOrderStatus,
  resendInvoice
} = require('../controllers/orderController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

// Public routes (but with optional auth to associate with user if logged in)
// POST /api/orders - Create new order
router.post('/', optionalAuth, createOrder);

// Protected routes (require authentication)
// GET /api/orders/my-orders - Get authenticated user's orders with pagination
router.get('/my-orders', authenticate, getMyOrders);

// GET /api/orders/user/:userId - Get user's orders (admin)
router.get('/user/:userId', authenticate, authorize('admin'), getUserOrders);

// GET /api/orders/:identifier - Get order by ID or order number (Public access for order confirmation)
router.get('/:identifier', getOrder);

// PATCH /api/orders/:id/status - Update order status (admin)
router.patch('/:id/status', authenticate, authorize('admin'), updateOrderStatus);

// POST /api/orders/:id/resend-invoice - Resend invoice email
router.post('/:id/resend-invoice', authenticate, resendInvoice);

module.exports = router;
