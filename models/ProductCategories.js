const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Category name is required"],
      trim: true,
      maxLength: [100, "Name cannot exceed 100 characters"],
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
//CategorySchema.index({ order: 1 });

module.exports = mongoose.model("Category", CategorySchema);
