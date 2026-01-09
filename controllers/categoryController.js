const { StatusCodes } = require("http-status-codes");
const categoryService = require("../services/categoryService");

const createCategory = async (req, res) => {
  try {
    const { name, isFeatured } = req.body;

    if (!name || isFeatured === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Category name or isFeatured is required",
      });
    }
    const newCategory = await categoryService.createCategory({
      name,
      isFeatured,
    });

    res.status(StatusCodes.CREATED).json({
      status: true,
      message: `${newCategory.name} Category created successfully`,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message || "Server Error",
    });
  }
};

const getAllCategories = async (req, res) => {
  const { limit, page } = req.query;
  try {
    const categories = await categoryService.getAllCategories();
    const total_rows = await categoryService.countCategories();

    const pagination = {
      total_rows,
      limit: parseInt(limit) || total_rows,
      page: parseInt(page) || 1,
      total_pages: Math.ceil(total_rows / (parseInt(limit) || total_rows)),
    };
    res.status(StatusCodes.OK).json({
      status: true,
      data: categories,
      pagination,
    });
  } catch (error) {
    console.error("Get all categories error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message || "Server Error",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await categoryService.getCategoryById(categoryId);
    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Category not found",
      });
    }
    res.status(StatusCodes.OK).json({
      status: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category by ID error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message || "Server Error",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, isFeatured } = req.body;

    if (!name || isFeatured === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Category name or isFeatured is required",
      });
    }

    const updatedCategory = await categoryService.updateCategory(categoryId, {
      name,
      isFeatured,
    });
    if (!updatedCategory) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Category not found",
      });
    }
    res.status(StatusCodes.OK).json({
      status: true,
      message: `${updatedCategory.name} Category updated successfully`,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message || "Server Error",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Category Id is required",
      });
    }
    const deletedCategory = await categoryService.deleteCategory(categoryId);

    if (!deletedCategory) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Category not found",
      });
    }

    res.status(StatusCodes.OK).json({
      status: true,
      message: `${deletedCategory.name} Category deleted successfully`,
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message || "Server Error",
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
