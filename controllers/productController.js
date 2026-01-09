const productService = require("../services/productService");
const catchAsync = require("../utils/catchAsync");
const { StatusCodes } = require("http-status-codes");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// @desc    Get flash deal products
// @route   GET /api/products/flash-deals
// @access  Public
exports.getFlashDeals = catchAsync(async (req, res) => {
  const products = await productService.getFlashDeals();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get just for you products (personalized recommendations)
// @route   GET /api/products/just-for-you
// @access  Public
exports.getJustForYou = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 12;
  const products = await productService.getJustForYou(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get new arrival products
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = catchAsync(async (req, res) => {
  const products = await productService.getNewArrivals();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = catchAsync(async (req, res) => {
  const products = await productService.getFeaturedProducts();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get featured grid products
// @route   GET /api/products/featured-grid
// @access  Public
exports.getFeaturedGridProducts = catchAsync(async (req, res) => {
  const products = await productService.getFeaturedGridProducts();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = catchAsync(async (req, res) => {
  const { category } = req.params;
  const limit = parseInt(req.query.limit) || 12;

  const products = await productService.getProductsByCategory(category, limit);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get single product by ID or slug
// @route   GET /api/products/:identifier
// @access  Public
exports.getProduct = catchAsync(async (req, res, next) => {
  const { identifier } = req.params;

  // Try to get by ID first, then by slug
  let product;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    // It's a valid MongoDB ObjectId
    product = await productService.getProductById(identifier);
  } else {
    // It's a slug
    product = await productService.getProductBySlug(identifier);
  }

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Get related products
// @route   GET /api/products/:identifier/related
// @access  Public
exports.getRelatedProducts = catchAsync(async (req, res, next) => {
  const { identifier } = req.params;
  const limit = parseInt(req.query.limit) || 8;

  // Get the product first
  let product;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    product = await productService.getProductById(identifier);
  } else {
    product = await productService.getProductBySlug(identifier);
  }

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const relatedProducts = await productService.getRelatedProducts(
    product._id,
    product.category,
    limit
  );

  res.status(200).json({
    success: true,
    count: relatedProducts.length,
    data: relatedProducts,
  });
});

// @desc    Search products
// @route   GET /api/products/search?q=query&category=&minPrice=&maxPrice=
// @access  Public
exports.searchProducts = catchAsync(async (req, res) => {
  const { q, category, minPrice, maxPrice, limit } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  const filters = {
    category,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    limit: limit ? parseInt(limit) : undefined,
  };

  const products = await productService.searchProducts(q, filters);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get all products with optional filters
// @route   GET /api/products?category=&sortBy=&minPrice=&maxPrice=&search=
// @access  Public
exports.getAllProducts = catchAsync(async (req, res) => {
  const { category, sortBy, minPrice, maxPrice, search } = req.query;

  const filters = {
    category,
    sortBy: sortBy || "newest",
    minPrice,
    maxPrice,
    search,
  };

  const products = await productService.getAllProducts(filters);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

/* ADMIN SECTION */
exports.getAlllProductsAdmin = catchAsync(async (req, res) => {
  try {
    const { page, limit } = req.query;
    //get the total document count

    const total_rows = await productService.countAllProducts();

    const products = await productService.getAllProductsAdmin({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total_rows: total_rows,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        total: Math.ceil(total_rows / (parseInt(limit) || 10)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
});

exports.createProduct = catchAsync(async (req, res) => {
  try {
    const productData = req.body;

    const {
      title,
      price,
      summary,
      description,
      size, //optional
      colors, //optional
      discount,
      category,
      catelogue,
    } = productData;

    if (
      !title ||
      !price ||
      //!size ||//optional
      !summary ||
      !description ||
      !category ||
      !discount ||
      !catelogue
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Incomplete product data",
      });
    }
    const { thumbnail, images } = req.files;

    if (!thumbnail || images.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({
          message: "Thumbnail and Images are required",
          statusCode: StatusCodes.NOT_FOUND,
        });
    }

    const thumbnailRes = await uploadToCloudinary(
      thumbnail[0].buffer,
      `product-thumbnails/${thumbnail[0].originalname}`
    );

    let imagesUrl = [];

    for (const img of images) {
      const imgRes = await uploadToCloudinary(
        img.buffer,
        `product-images/${img.originalname}`
      );
      imagesUrl.push(imgRes.url);
    }

    if (!thumbnailRes.url || imagesUrl.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Failed to upload thumbnail or images",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const splitTitle = title.split(" ");
    const sku = `FS-${splitTitle[1]}-${Math.floor(Math.random() * 1000)}`;

    productData.thumbnail = thumbnailRes.url;
    productData.images = imagesUrl;
    productData.slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");
    productData.price = parseFloat(price);
    productData.size = size || null;
    productData.colors = colors
      ? JSON.stringify(colors)
          .split(",")
          .map((color) => color.trim())
      : [];
    productData.discount = discount ? parseFloat(discount) : 0;
    productData.category = category || null;
    productData.catelogue = catelogue || null;
    productData.sku = sku || null;
    productData.summary = summary || null;
    productData.description = description || null;

    const newProduct = await productService.createProduct(productData);

    if (!newProduct) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Failed to create product",
      });
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Product created successfully",
      statusCode: StatusCodes.CREATED,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Server Error",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
});
exports.editProduct = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    //check if id and productData are provided
    if (!id || !productData) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Product ID and data are required",
      });
    }

    //scenarios where images are being updated
    if (req.files) {
      const { thumbnail, images } = req.files;

      if (thumbnail) {
        const thumbnailRes = await uploadToCloudinary(
          thumbnail[0].buffer,
          `product-thumbnails/${thumbnail[0].originalname}`
        );
        if (thumbnailRes.url) {
          productData.thumbnail = thumbnailRes.url;
        }
      }
      //NOTE: images is an array of files or urls, so we need to handle accordingly incase out of 5 only 3 are updated

      // Get existing images from request body (URLs to keep)
      const existingImages = productData.existingImages
        ? JSON.parse(productData.existingImages)
        : [];

      if (images && images.length > 0) {
        let newImagesUrl = [];
        for (const img of images) {
          const imgRes = await uploadToCloudinary(
            img.buffer,
            `product-images/${img.originalname}`
          );
          newImagesUrl.push(imgRes.url);
        }
        // Combine existing URLs with newly uploaded URLs
        productData.images = [...existingImages, ...newImagesUrl];
      } else {
        // No new images, just keep existing ones
        productData.images = existingImages;
      }

      // Clean up the temporary field
      delete productData.existingImages;
    }

    // Add logic to update the product using productService
    const updatedProduct = await productService.editProduct(id, productData);

    if (!updatedProduct) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Failed to update product",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
      statusCode: StatusCodes.OK,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Server Error",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
});

exports.deleteProduct = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Product ID is required",
      });
    }
    const deletedProduct = await productService.deleteProduct(id);

    console.log("Deleted Product:", deletedProduct);

    if (!deletedProduct) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Failed to delete product",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Product deleted successfully",
      statusCode: StatusCodes.OK,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Server Error",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
});
