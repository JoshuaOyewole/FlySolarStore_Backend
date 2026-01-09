const express = require("express");
const router = express.Router();
const {
  getFlashDeals,
  getJustForYou,
  getNewArrivals,
  getFeaturedProducts,
  getFeaturedGridProducts,
  getProductsByCategory,
  getProduct,
  searchProducts,
  getAllProducts,
  getRelatedProducts,
  getAlllProductsAdmin,
  createProduct,
  editProduct,
  deleteProduct,
} = require("../controllers/productController");
const { getTokenFromHeaders, adminOnly } = require("../middleware/auth");
const productImageUpload = require("../middleware/upload");
// GET /api/products - Get all products with filters
router.get("/", getAllProducts);

/* ADMIN SECTION */
router.get(
  "/admin/products",
  getTokenFromHeaders,
  adminOnly,
  getAlllProductsAdmin
);

router.post(
  "/admin/products",
  getTokenFromHeaders,
  adminOnly,
  productImageUpload,
  createProduct
);
// GET /api/products/admin/products/:id - Edit product
router.put(
  "/admin/products/:id",
  getTokenFromHeaders,
  adminOnly,
  productImageUpload,
  editProduct
);
// DELETE /api/products/admin/product/:id - Delete product
router.delete(
  "/admin/product/:id",
  getTokenFromHeaders,
  adminOnly,
  deleteProduct
);
// GET /api/products/flash-deals
router.get("/flash-deals", getFlashDeals);

// GET /api/products/just-for-you
router.get("/just-for-you", getJustForYou);

// GET /api/products/new-arrivals
router.get("/new-arrivals", getNewArrivals);

// GET /api/products/featured
router.get("/featured", getFeaturedProducts);

// GET /api/products/featured-grid
router.get("/featured-grid", getFeaturedGridProducts);

// GET /api/products/search
router.get("/search", searchProducts);

// GET /api/products/category/:category
router.get("/category/:category", getProductsByCategory);

// GET /api/products/:identifier/related - Must be before /:identifier
router.get("/:identifier/related", getRelatedProducts);

// GET /api/products/:identifier (ID or slug)
router.get("/:identifier", getProduct);

module.exports = router;
