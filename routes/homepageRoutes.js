const express = require("express");
const router = express.Router();
const {
  getHeroBanners,
  getPromoBanners,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
  getAllBanners,
} = require("../controllers/homepageController");
const { validateBanner, validateBannerUpdate } = require("../validators/bannerValidator");
const { adminOnly, getTokenFromHeaders } = require("../middleware/auth");
const { bannerImageUpload } = require("../middleware/upload");


// GET /api/homepage/hero-banners
router.get("/hero-banners", getHeroBanners);

// GET /api/homepage/all-banners (Protected - Admin only)
router.get(
  "/all-banners",
  getTokenFromHeaders,
  adminOnly,
  getAllBanners
);

// POST /api/homepage/hero-banners (Protected - Admin only)
router.post(
  "/hero-banners",
  getTokenFromHeaders,
  adminOnly,
  bannerImageUpload,
  validateBanner,
  createHeroBanner
);

// PUT /api/homepage/hero-banners/:id (Protected - Admin only)
router.put(
  "/hero-banners/:id",
  getTokenFromHeaders,
  adminOnly,
  bannerImageUpload,
  validateBannerUpdate,
  updateHeroBanner
);

// DELETE /api/homepage/hero-banners/:id (Protected - Admin only)
router.delete(
  "/hero-banners/:id",
  getTokenFromHeaders,
  adminOnly,
  deleteHeroBanner
);

// GET /api/homepage/promo-banners
router.get("/promo-banners", getPromoBanners);

module.exports = router;
