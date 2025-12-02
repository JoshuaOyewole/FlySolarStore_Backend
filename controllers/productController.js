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

// @desc    Get featured grid products
// @route   GET /api/products/featured-grid
// @access  Public
exports.getFeaturedGridProducts = catchAsync(async (req, res) => {
  const products = await productService.getFeaturedGridProducts();

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

// @desc    Get single product by ID or slug
// @route   GET /api/products/:identifier
// @access  Public
exports.getProduct = catchAsync(async (req, res, next) => {
  const { identifier } = req.params;
  
  // Try to get by ID first, then by slug
  let product;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    // It's a valid MongoDB ObjectId
    product = await productService.getProductById(identifier);
  } else {
    // It's a slug
    product = await productService.getProductBySlug(identifier);
  }

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Get related products
// @route   GET /api/products/:identifier/related
// @access  Public
exports.getRelatedProducts = catchAsync(async (req, res, next) => {
  const { identifier } = req.params;
  const limit = parseInt(req.query.limit) || 8;
  
  // Get the product first
  let product;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    product = await productService.getProductById(identifier);
  } else {
    product = await productService.getProductBySlug(identifier);
  }

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const relatedProducts = await productService.getRelatedProducts(
    product._id,
    product.categories,
    limit
  );

  res.status(200).json({
    success: true,
    count: relatedProducts.length,
    data: relatedProducts
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

// @desc    Get all products with optional filters
// @route   GET /api/products?category=&sortBy=&minPrice=&maxPrice=&search=
// @access  Public
exports.getAllProducts = catchAsync(async (req, res) => {
  const { category, sortBy, minPrice, maxPrice, search } = req.query;

  const filters = {
    category,
    sortBy: sortBy || 'newest',
    minPrice,
    maxPrice,
    search
  };

  const products = await productService.getAllProducts(filters);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});
