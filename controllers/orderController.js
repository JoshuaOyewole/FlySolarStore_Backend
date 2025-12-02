const orderService = require('../services/orderService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendOrderConfirmation } = require('../utils/email');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (can be protected later)
exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, shippingAddress, billingAddress, sameAsShipping } = req.body;

  // Validation
  if (!items || items.length === 0) {
    return next(new AppError('Order must contain at least one item', 400));
  }

  if (!shippingAddress) {
    return next(new AppError('Shipping address is required', 400));
  }

  if (!sameAsShipping && !billingAddress) {
    return next(new AppError('Billing address is required', 400));
  }

  // Create order
  const order = await orderService.createOrder({
    items,
    shippingAddress,
    billingAddress,
    sameAsShipping: sameAsShipping || false
  });

  // Send invoice email
  try {
    await sendOrderConfirmation(order);
    await orderService.markInvoiceSent(order._id);
  } catch (emailError) {
    console.error('Failed to send order confirmation email:', emailError);
    // Don't fail the order creation if email fails
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order
  });
});

// @desc    Get order by ID or order number
// @route   GET /api/orders/:identifier
// @access  Public (should be protected in production)
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
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Get user orders
// @route   GET /api/orders/user/:userId
// @access  Private (requires authentication)
exports.getUserOrders = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { status } = req.query;

  const orders = await orderService.getUserOrders(userId, { status });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (admin only)
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  const order = await orderService.updateOrderStatus(id, status);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: order
  });
});

// @desc    Resend invoice email
// @route   POST /api/orders/:id/resend-invoice
// @access  Public (should be protected in production)
exports.resendInvoice = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await orderService.getOrderById(id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  try {
    await sendOrderConfirmation(order);
    await orderService.markInvoiceSent(order._id);

    res.status(200).json({
      success: true,
      message: 'Invoice sent successfully'
    });
  } catch (error) {
    return next(new AppError('Failed to send invoice', 500));
  }
});
