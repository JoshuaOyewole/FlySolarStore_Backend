const Product = require('../models/Product');

class ProductService {
  async getFlashDeals() {
    const products = await Product.find({
      isFlashDeal: true,
      isActive: true,
      flashDealEndDate: { $gte: new Date() },
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
      isNewArrival: true,
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
      // Increment views
      product.views += 1;
      await product.save();
    }

    return product;
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
}

module.exports = new ProductService();
