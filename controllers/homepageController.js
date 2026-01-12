const bannerService = require('../services/bannerService');
const catchAsync = require('../utils/catchAsync');
const cloudinary = require('../config/cloudinary');

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

// @desc    Get all banners (admin)
// @route   GET /api/homepage/all-banners
// @access  Private/Admin
exports.getAllBanners = catchAsync(async (req, res) => {
  const banners = await bannerService.getAllBanners();

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

  // If an image was uploaded, upload to Cloudinary
  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'banners',
      resource_type: 'auto',
    });
    
    bannerData.imgUrl = uploadResult.secure_url;
  }

  const banner = await bannerService.createBanner(bannerData);

  res.status(201).json({
    success: true,
    message: 'Hero banner created successfully',
    data: banner
  });
});

// @desc    Update a hero banner
// @route   PUT /api/homepage/hero-banners/:id
// @access  Private/Admin
exports.updateHeroBanner = catchAsync(async (req, res) => {
  const { id } = req.params;


  // Build update data from form fields
  const updateData = { ...req.body };

  // If a new image was uploaded, upload to Cloudinary
  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'banners',
      resource_type: 'auto',
    });
    
    updateData.imgUrl = uploadResult.secure_url;
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No data provided for update'
    });
  }
  
  const banner = await bannerService.updateBanner(id, updateData);
  res.status(200).json({
    success: true,
    message: 'Banner updated successfully',
    data: banner
  });
});

// @desc    Delete a hero banner
// @route   DELETE /api/homepage/hero-banners/:id
// @access  Private/Admin
exports.deleteHeroBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  await bannerService.deleteBanner(id);

  res.status(200).json({
    success: true,
    message: 'Banner deleted successfully'
  });
});
