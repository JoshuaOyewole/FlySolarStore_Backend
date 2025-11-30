const productService = require('../services/productService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get flash deal products
// @route   GET /api/products/flash-deals
// @access  Public
exports.getFlashDeals = catchAsync(async (req, res) => {
  const products = await productService.getFlashDeals();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get just for you products (personalized recommendations)
// @route   GET /api/products/just-for-you
// @access  Public
exports.getJustForYou = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 12;
  const products = await productService.getJustForYou(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get new arrival products
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = catchAsync(async (req, res) => {
  const products = await productService.getNewArrivals();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = catchAsync(async (req, res) => {
  const products = await productService.getFeaturedProducts();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = catchAsync(async (req, res) => {
  const { category } = req.params;
  const limit = parseInt(req.query.limit) || 12;
  
  const products = await productService.getProductsByCategory(category, limit);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await productService.getProductById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Search products
// @route   GET /api/products/search?q=query&category=&minPrice=&maxPrice=
// @access  Public
exports.searchProducts = catchAsync(async (req, res) => {
  const { q, category, minPrice, maxPrice, limit } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const filters = {
    category,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    limit: limit ? parseInt(limit) : undefined
  };

  const products = await productService.searchProducts(q, filters);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});
