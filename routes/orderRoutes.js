const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrder,
  getUserOrders,
  getMyOrders,
  updateOrderStatus,
  resendInvoice,
  getAllOrders,
  getOrderDetails,
} = require("../controllers/orderController");
const {
  adminOnly,
  getTokenFromHeaders,
  userOnly,
} = require("../middleware/auth");

//@desc fetch all orders with pagination (admin)
//@route GET /api/orders/admin/all-orders
//@access Private (admin only)
router.get("/admin/all-orders", getTokenFromHeaders, adminOnly, getAllOrders);

//@desc fetch orders  (admin)
//@route GET /api/orders/admin/all-orders/detail
//@access Private (admin only)
router.get(
  "/admin/all-orders/detail",
  getTokenFromHeaders,
  adminOnly,
  getOrderDetails
);

// Public routes (but with optional auth to associate with user if logged in)
// POST /api/orders - Create new order
router.post("/", createOrder);

// Protected routes (require authentication)
// GET /api/orders/my-orders - Get authenticated user's orders with pagination
router.get("/my-orders", getTokenFromHeaders, userOnly, getMyOrders);

// GET /api/orders/user/:userId - Get user's orders (admin)
router.get("/user/:userId", getTokenFromHeaders, adminOnly, getUserOrders);

// GET /api/orders/:identifier - Get order by ID or order number (Public access for order confirmation)
router.get("/:identifier", getOrder);

// PATCH /api/orders/:id/status - Update order status (admin)
router.patch("/:id/status", getTokenFromHeaders, adminOnly, updateOrderStatus);

// POST /api/orders/:id/resend-invoice - Resend invoice email
router.post(
  "/:id/resend-invoice",
  getTokenFromHeaders,
  userOnly,
  resendInvoice
);

module.exports = router;
