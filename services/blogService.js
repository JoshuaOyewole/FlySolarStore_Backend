const Blog = require('../models/Blog');

class BlogService {
  async getLatestBlogs(limit = 6) {
    const blogs = await Blog.find({
      isPublished: true
    })
    .populate('author', 'firstName lastName avatar')
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select('-content -__v')
    .lean();

    return blogs;
  }

  async getBlogBySlug(slug) {
    const blog = await Blog.findOne({ slug, isPublished: true })
      .populate('author', 'firstName lastName avatar')
      .select('-__v');

    if (blog) {
      // Increment views
      blog.views += 1;
      await blog.save();
    }

    return blog;
  }

  async getBlogsByCategory(category, limit = 10) {
    const blogs = await Blog.find({
      categories: category,
      isPublished: true
    })
    .populate('author', 'firstName lastName')
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select('-content -__v')
    .lean();

    return blogs;
  }

  async searchBlogs(query) {
    const blogs = await Blog.find({
      isPublished: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('author', 'firstName lastName')
    .sort({ publishedAt: -1 })
    .limit(20)
    .select('-content -__v')
    .lean();

    return blogs;
  }
}

module.exports = new BlogService();
