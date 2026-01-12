const express = require("express");
const router = express.Router();
const {
  getLatestBlogs,
  getBlogBySlug,
  getBlogsByCategory,
  searchBlogs,
  postBlog,
  editBlog,
  deleteBlog,
  getAllBlogs,
  getAllArticles
} = require("../controllers/blogController");

const { adminOnly, getTokenFromHeaders } = require("../middleware/auth");

const { blogImageUpload } = require("../middleware/upload");

//POST /api/blogs
router.post("/", getTokenFromHeaders, adminOnly, blogImageUpload, postBlog);

//UPDATE /api/blogs/:id
router.put("/:id", getTokenFromHeaders, adminOnly, blogImageUpload, editBlog);

//DELETE /api/blogs/:id
router.delete("/:id", getTokenFromHeaders, adminOnly, deleteBlog);

// GET /api/blogs/latest
router.get("/latest", getLatestBlogs);
router.get("/users", getAllArticles);

//GET /api/blogs/admin
router.get("/admin", getTokenFromHeaders, adminOnly, getAllBlogs);

// GET /api/blogs/search
router.get("/search", searchBlogs);

// GET /api/blogs/category/:category
router.get("/category/:category", getBlogsByCategory);

// GET /api/blogs/:slug
router.get("/:slug", getBlogBySlug);

module.exports = router;
