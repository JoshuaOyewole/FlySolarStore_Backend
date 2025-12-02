const Product = require('../models/Product');

class ProductService {
  async getFlashDeals() {
    const products = await Product.find({
      'for.type': 'flash-deals',
      isActive: true,
      stock: { $gt: 0 }
    })
    .sort({ discount: -1 })
    .limit(12)
    .select('-__v')
    .lean();

    return products;
  }

  async getJustForYou(limit = 12) {
    // Algorithm: Mix of popular (by views) and highly rated products
    const products = await Product.find({
      'for.type': 'just-for-you',
      isActive: true,
      stock: { $gt: 0 }
    })
    .sort({ views: -1, rating: -1 })
    .limit(limit)
    .select('-__v')
    .lean();

    return products;
  }

  async getNewArrivals() {
    const products = await Product.find({
      'for.type': 'new-arrivals',
      isActive: true,
      stock: { $gt: 0 }
    })
    .sort({ createdAt: -1 })
    .limit(12)
    .select('-__v')
    .lean();

    return products;
  }

  async getFeaturedProducts() {
    const products = await Product.find({
      isFeatured: true,
      isActive: true,
      stock: { $gt: 0 }
    })
    .sort({ rating: -1, views: -1 })
    .limit(12)
    .select('-__v')
    .lean();

    return products;
  }

  async getFeaturedGridProducts() {
    const products = await Product.find({
      'for.type': 'featured-grid',
      isActive: true,
      stock: { $gt: 0 }
    })
    .sort({ views: -1, rating: -1 })
    .limit(6)
    .select('-__v')
    .lean();

    return products;
  }

  async getProductsByCategory(category, limit = 12) {
    const products = await Product.find({
      categories: category,
      isActive: true,
      stock: { $gt: 0 }
    })
    .sort({ rating: -1 })
    .limit(limit)
    .select('-__v')
    .lean();

    return products;
  }

  async getProductById(id) {
    const product = await Product.findById(id).select('-__v');
    
    if (product) {
      // Increment views without triggering save hooks
      await Product.updateOne(
        { _id: product._id },
        { $inc: { views: 1 } }
      );
      product.views += 1; // Update in-memory for return
    }

    return product;
  }

  async getProductBySlug(slug) {
    const product = await Product.findOne({ slug, isActive: true }).select('-__v');
    
    if (product) {
      // Increment views without triggering save hooks
      await Product.updateOne(
        { _id: product._id },
        { $inc: { views: 1 } }
      );
      product.views += 1; // Update in-memory for return
    }

    return product;
  }

  async getRelatedProducts(productId, categories, limit = 8) {
    const products = await Product.find({
      _id: { $ne: productId },
      categories: { $in: categories },
      isActive: true,
      stock: { $gt: 0 }
    })
    .sort({ rating: -1, views: -1 })
    .limit(limit)
    .select('-__v')
    .lean();

    return products;
  }

  async searchProducts(query, filters = {}) {
    const searchCriteria = {
      isActive: true,
      stock: { $gt: 0 },
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { categories: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    };

    if (filters.category) {
      searchCriteria.categories = filters.category;
    }

    if (filters.minPrice || filters.maxPrice) {
      searchCriteria.price = {};
      if (filters.minPrice) searchCriteria.price.$gte = filters.minPrice;
      if (filters.maxPrice) searchCriteria.price.$lte = filters.maxPrice;
    }

    const products = await Product.find(searchCriteria)
      .sort({ rating: -1, views: -1 })
      .limit(filters.limit || 50)
      .select('-__v')
      .lean();

    return products;
  }

  async getAllProducts(filters = {}) {
    const query = {
      isActive: true,
      stock: { $gt: 0 }
    };

    // Filter by category
    if (filters.category && filters.category !== 'All Products') {
      if (filters.category === 'On Sale') {
        query.discount = { $gt: 0 };
      } else {
        query.categories = filters.category;
      }
    }

    // Filter by price range
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
    }

    // Search query
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { categories: { $regex: filters.search, $options: 'i' } }
      ];
    }

    let sortOptions = {};
    switch (filters.sortBy) {
      case 'price-low':
        sortOptions = { price: 1 };
        break;
      case 'price-high':
        sortOptions = { price: -1 };
        break;
      case 'popular':
        sortOptions = { rating: -1, views: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const products = await Product.find(query)
      .sort(sortOptions)
      .select('-__v')
      .lean();

    return products;
  }
}

module.exports = new ProductService();
