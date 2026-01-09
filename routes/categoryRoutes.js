const express = require("express");
const router = express.Router();
const { adminOnly, getTokenFromHeaders } = require("../middleware/auth");
const {
  createCategory,
  updateCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
} = require("../controllers/categoryController");

// Create a new category
router.post(
  "/create",
  getTokenFromHeaders,
  adminOnly,
  createCategory
);

router.put("/edit/:categoryId", getTokenFromHeaders, adminOnly, updateCategory);
router.delete(
  "/delete/:categoryId",
  getTokenFromHeaders,
  adminOnly,
  deleteCategory
);
router.get("/", getTokenFromHeaders, adminOnly, getAllCategories);
router.get("/:categoryId", getTokenFromHeaders, adminOnly, getCategoryById);

module.exports = router;
