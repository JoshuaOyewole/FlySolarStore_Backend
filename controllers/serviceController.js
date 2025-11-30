const serviceService = require('../services/serviceService');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getAllServices = catchAsync(async (req, res) => {
  const services = await serviceService.getAllServices();

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});
