const catchAsync = require("../utils/catchAsync");
const { StatusCodes } = require("http-status-codes");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const blogService = require("../services/blogService");

// @desc    Get latest blog posts
// @route   GET /api/blogs/latest
// @access  Public
exports.getLatestBlogs = catchAsync(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const blogs = await blogService.getLatestBlogs(limit);

    res.status(StatusCodes.OK).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (err) {
    console.log("Error getting latest blogs:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || "Failed to get latest blogs",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
});

// @desc    Get blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
exports.getBlogBySlug = catchAsync(async (req, res) => {
  const blog = await blogService.getBlogBySlug(req.params.slug);

  if (!blog) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Blog post not found",
      statusCode: StatusCodes.NOT_FOUND,
    });
  }

  res.status(200).json({
    success: true,
    data: blog,
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
    data: blogs,
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
      message: "Search query is required",
    });
  }

  const blogs = await blogService.searchBlogs(q);

  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs,
  });
});

// @desc Post a blog
// @route POST /api/blogs
// @access Private/Admin

exports.postBlog = catchAsync(async (req, res) => {
  try {
    const blogData = req.body;

    const { title, description, category, content, tags } = blogData;

    if (!title || !description || !category || !content || !tags) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Missing required fields",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const { thumbnail, coverImg } = req.files;

    if (!thumbnail || !coverImg) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Thumbnail and Cover Image are required",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }
    const thumbnailRes = await uploadToCloudinary(
      thumbnail[0].buffer,
      `blog-thumbnails/${thumbnail[0].originalname}`
    );

    const coverImgRes = await uploadToCloudinary(
      coverImg[0].buffer,
      `blog-coverImgs/${coverImg[0].originalname}`
    );

    blogData.thumbnailUrl = thumbnailRes.secure_url;
    blogData.coverImgUrl = coverImgRes.secure_url;
    blogData.author = req.user.id;
    blogData.isPublished = true;
    blogData.slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");

    const newBlog = await blogService.createBlog(blogData);

    if (!newBlog) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to post blog",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Blog created successfully",
      statusCode: StatusCodes.CREATED,
    });
  } catch (err) {
    console.log("Error posting blog:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || "Failed to post blog",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
});

exports.editBlog = catchAsync(async (req, res) => {
  // Implementation for editing a blog post

  try {
    const { id } = req.params;
    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Blog ID is required",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const blogData = req.body;

    if (!blogData) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Missing required fields",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    //scenarios where coverImage or thumbnail are being updated
    if (req.files) {
      const { thumbnail, coverImg } = req.files;
      console.log("thumbnail and coverImg files:", req.files);
      if (thumbnail) {
        const thumbnailRes = await uploadToCloudinary(
          thumbnail[0].buffer,
          `blog-thumbnails/${thumbnail[0].originalname}`
        );

        console.log("Thumbnail upload response:", thumbnailRes);

        if (thumbnailRes.secure_url) {
          blogData.thumbnailUrl = thumbnailRes.secure_url;
        }
      }
      if (coverImg) {
        const coverImgRes = await uploadToCloudinary(
          coverImg[0].buffer,
          `blog-coverImgs/${coverImg[0].originalname}`
        );
        if (coverImgRes.secure_url) {
          blogData.coverImgUrl = coverImgRes.secure_url;
        }
      }
    }

    const updatedBlog = await blogService.updateBlog(id, blogData);

    if (!updatedBlog) {
      console.log("Failed to update blog", updatedBlog);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to edit blog",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
    // Your edit blog logic here
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Blog edited successfully",
      statusCode: StatusCodes.OK,
    });
  } catch (err) {
    console.log("Error editing blog:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || "Failed to edit blog",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
});

exports.deleteBlog = catchAsync(async (req, res) => {
  // Implementation for deleting a blog post
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Blog ID is required",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const deletedBlog = await blogService.deleteBlog(id);

    if (!deletedBlog) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to delete blog",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Blog deleted successfully",
      statusCode: StatusCodes.OK,
    });
  } catch (err) {
    console.log("Error deleting blog:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || "Failed to delete blog",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
});

exports.getAllBlogs = catchAsync(async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const blogs = await blogService.getAllBlogs({ limit, page });

    res.status(StatusCodes.OK).json({
      success: true,
      data: blogs,
      statusCode: StatusCodes.OK,
    });
  } catch (err) {
    console.log("Error getting all blogs:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || "Failed to get blogs",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
});
exports.getAllArticles = catchAsync(async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const blogs = await blogService.getAllBlogs({ limit, page });

    if (blogs.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "No articles found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: blogs,
      statusCode: StatusCodes.OK,
    });
  } catch (err) {
    console.log("Error getting all blogs:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || "Failed to get blogs",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
});
