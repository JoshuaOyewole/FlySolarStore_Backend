const orderService = require("../services/orderService");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { sendOrderConfirmation } = require("../utils/email");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
// @desc    Create new order
// @route   POST /api/orders
// @access  Public (with optional auth)
exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, shippingAddress } = req.body;

  let token = null;

  // Validation
  if (!items || items.length === 0) {
    return next(new AppError("Order must contain at least one item", 400));
  }

  if (!shippingAddress) {
    return next(new AppError("Shipping address is required", 400));
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Use authenticated user's ID if available, otherwise allow guest checkout
  const userId = decoded ? decoded.id : null;

  // Create order with optional user association
  const order = await orderService.createOrder({
    items,
    shippingAddress,
    userId,
  });

  // Send invoice email
  try {
    await sendOrderConfirmation(order);
    await orderService.markInvoiceSent(order._id);
  } catch (emailError) {
    console.error("Failed to send order confirmation email:", emailError);
    // Don't fail the order creation if email fails
  }

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: order,
  });
});

// @desc    Get order by ID or order number
// @route   GET /api/orders/:identifier
// @access  Public (for order confirmation viewing)
exports.getOrder = catchAsync(async (req, res, next) => {
  const { identifier } = req.params;

  let order;

  // Check if it's a MongoDB ObjectId or order number
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    order = await orderService.getOrderById(identifier);
  } else {
    order = await orderService.getOrderByOrderNumber(identifier);
  }

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});
// @desc    Get order by ID or order number
exports.getOrderDetails = catchAsync(async (req, res, next) => {
  const { orderId } = req.query;

  const order = await orderService.getOrderById(orderId);
  console.log("Fetched order details for orderId:", orderId, order);
  if (!order) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Order not found",
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: order,
  });
});

// @desc    Get authenticated user's orders with pagination
// @route   GET /api/orders/my-orders
// @access  Private (requires authentication)
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { orders, total } = await orderService.getUserOrdersWithPagination(
    userId,
    { skip, limit }
  );

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    },
  });
});

// @desc    Get user orders (admin)
// @route   GET /api/orders/user/:userId
// @access  Private (admin only)
exports.getUserOrders = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { status } = req.query;

  const orders = await orderService.getUserOrders(userId, { status });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (admin only)
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return next(new AppError("Status is required", 400));
  }

  const order = await orderService.updateOrderStatus(id, status);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
});

// @desc    Resend invoice email
// @route   POST /api/orders/:id/resend-invoice
// @access  Public (should be protected in production)
exports.resendInvoice = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await orderService.getOrderById(id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  try {
    await sendOrderConfirmation(order);
    await orderService.markInvoiceSent(order._id);

    res.status(200).json({
      success: true,
      message: "Invoice sent successfully",
    });
  } catch (error) {
    return next(new AppError("Failed to send invoice", 500));
  }
});

//@desc fetching all orders with pagination for admin
// @route   GET /api/admin/all-orders

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { orders, total } = await orderService.getAllOrdersWithPagination({
    skip,
    limit,
  });
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total_rows: total,
      },
    },
  });
});
