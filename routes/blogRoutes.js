const express = require('express');
const router = express.Router();
const {
  getLatestBlogs,
  getBlogBySlug,
  getBlogsByCategory,
  searchBlogs
} = require('../controllers/blogController');

// GET /api/blogs/latest
router.get('/latest', getLatestBlogs);

// GET /api/blogs/search
router.get('/search', searchBlogs);

// GET /api/blogs/category/:category
router.get('/category/:category', getBlogsByCategory);

// GET /api/blogs/:slug
router.get('/:slug', getBlogBySlug);

module.exports = router;
