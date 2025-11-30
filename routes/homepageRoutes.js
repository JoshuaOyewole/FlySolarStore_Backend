const express = require('express');
const router = express.Router();
const { getHeroBanners, getPromoBanners, createHeroBanner } = require('../controllers/homepageController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateBanner } = require('../validators/bannerValidator');

// GET /api/homepage/hero-banners
router.get('/hero-banners', getHeroBanners);

// POST /api/homepage/hero-banners (Protected - Admin only)
router.post('/hero-banners', authenticate, authorize('admin'), validateBanner, createHeroBanner);

// GET /api/homepage/promo-banners
router.get('/promo-banners', getPromoBanners);

module.exports = router;
