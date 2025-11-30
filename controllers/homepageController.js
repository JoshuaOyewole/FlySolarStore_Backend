const bannerService = require('../services/bannerService');
const catchAsync = require('../utils/catchAsync');

// @desc    Get hero banners
// @route   GET /api/homepage/hero-banners
// @access  Public
exports.getHeroBanners = catchAsync(async (req, res) => {
  const banners = await bannerService.getHeroBanners();

  res.status(200).json({
    success: true,
    count: banners.length,
    data: banners
  });
});

// @desc    Get promo banners
// @route   GET /api/homepage/promo-banners
// @access  Public
exports.getPromoBanners = catchAsync(async (req, res) => {
  const banners = await bannerService.getPromoBanners();

  res.status(200).json({
    success: true,
    count: banners.length,
    data: banners
  });
});

// @desc    Create a hero banner
// @route   POST /api/homepage/hero-banners
// @access  Private/Admin
exports.createHeroBanner = catchAsync(async (req, res) => {
  // Set type to 'hero' automatically
  const bannerData = {
    ...req.body,
    type: 'hero',
  };

  const banner = await bannerService.createBanner(bannerData);

  res.status(201).json({
    success: true,
    message: 'Hero banner created successfully',
    data: banner
  });
});
