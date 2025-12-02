const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrder,
  getUserOrders,
  updateOrderStatus,
  resendInvoice
} = require('../controllers/orderController');

// POST /api/orders - Create new order
router.post('/', createOrder);

// GET /api/orders/:identifier - Get order by ID or order number
router.get('/:identifier', getOrder);

// GET /api/orders/user/:userId - Get user's orders
router.get('/user/:userId', getUserOrders);

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', updateOrderStatus);

// POST /api/orders/:id/resend-invoice - Resend invoice email
router.post('/:id/resend-invoice', resendInvoice);

module.exports = router;
