const blogService = require('../services/blogService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get latest blog posts
// @route   GET /api/blogs/latest
// @access  Public
exports.getLatestBlogs = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  const blogs = await blogService.getLatestBlogs(limit);

  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs
  });
});

// @desc    Get blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
exports.getBlogBySlug = catchAsync(async (req, res, next) => {
  const blog = await blogService.getBlogBySlug(req.params.slug);

  if (!blog) {
    return next(new AppError('Blog post not found', 404));
  }

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Get blogs by category
// @route   GET /api/blogs/category/:category
// @access  Public
exports.getBlogsByCategory = catchAsync(async (req, res) => {
  const { category } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  
  const blogs = await blogService.getBlogsByCategory(category, limit);

  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs
  });
});

// @desc    Search blogs
// @route   GET /api/blogs/search?q=query
// @access  Public
exports.searchBlogs = catchAsync(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const blogs = await blogService.searchBlogs(q);

  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs
  });
});
