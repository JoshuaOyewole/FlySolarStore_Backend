const Blog = require("../models/Blog");

class BlogService {
  async getLatestBlogs(limit = 6) {
    const blogs = await Blog.find({
      isPublished: true,
    })
     .populate("author", "firstName lastName avatar")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select("-content -__v")
      .lean();

    return blogs;
  }

  async getBlogBySlug(slug) {
    const blog = await Blog.findOne({ slug, isPublished: true })
      .populate("author", "firstName lastName")
      .select("-__v");

    if (blog) {
      // Increment views
      blog.views += 1;
      await blog.save();
    }

    return blog;
  }

  async getBlogsByCategory(category, limit = 10) {
    const blogs = await Blog.find({
      category,
      isPublished: true,
    })
      .populate("author", "firstName lastName")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select("-content -__v")
      .lean();

    return blogs;
  }

  async searchBlogs(query) {
    const blogs = await Blog.find({
      isPublished: true,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { excerpt: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
    })
      .populate("author", "firstName lastName")
      .sort({ publishedAt: -1 })
      .limit(20)
      .select("-content -__v")
      .lean();

    return blogs;
  }

  async createBlog(blogData) {
    const blog = new Blog(blogData);
    await blog.save();
    return blog;
  }

  async updateBlog(id, blogData) {
  
    const blog = await Blog.findByIdAndUpdate(
      { _id: id },
      { $set: blogData },
      { new: true, runValidators: true }
    );
    if (!blog) {
      throw new Error("Blog not found");
    }
    return blog;
  }

  async deleteBlog(id) {
    const res = await Blog.findByIdAndDelete(id);
    return res;
  }
  async getAllBlogs({ limit = 10, page = 1 }) {
    const skip = (page - 1) * limit;
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean();
    return blogs;
  }

}

module.exports = new BlogService();
