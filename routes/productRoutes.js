const express = require('express');
const router = express.Router();
const {
  getFlashDeals,
  getJustForYou,
  getNewArrivals,
  getFeaturedProducts,
  getProductsByCategory,
  getProduct,
  searchProducts
} = require('../controllers/productController');

// GET /api/products/flash-deals
router.get('/flash-deals', getFlashDeals);

// GET /api/products/just-for-you
router.get('/just-for-you', getJustForYou);

// GET /api/products/new-arrivals
router.get('/new-arrivals', getNewArrivals);

// GET /api/products/featured
router.get('/featured', getFeaturedProducts);

// GET /api/products/search
router.get('/search', searchProducts);

// GET /api/products/category/:category
router.get('/category/:category', getProductsByCategory);

// GET /api/products/:id
router.get('/:id', getProduct);

module.exports = router;
