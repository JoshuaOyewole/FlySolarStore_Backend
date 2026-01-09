const category = require("../models/ProductCategories");

const categoryService = {
  createCategory: async (data) => {
    const cat = new category(data);
    return await cat.save();
  },

  getAllCategories: async () => {
    return await category.find();
  },
  getCategoryById: async (id) => {
    return await category.findById(id);
  },
  updateCategory: async (id, data) => {
    return await category.findByIdAndUpdate(id, data, { new: true });
  },
  deleteCategory: async (id) => {
    return await category.findByIdAndDelete(id);
  },
  countCategories: async () => {
    return await category.countDocuments();
  },
};

module.exports = categoryService;
