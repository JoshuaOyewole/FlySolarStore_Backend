const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      unique: [true, "Product with this title already exists"],
      maxLength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minLength: [300, "Description cannot be less than 300 characters"],
    },
    summary: {
      type: String,
      required: [true, "Product summary is required"],
      trim: true,
      maxLength: [500, "Summary cannot exceed 500 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: [true, "Slug is should be unique"],
      lowercase: true,
    },
    brand: {
      type: String,
      trim: true,
      default: null,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    size: {
      type: String,
      default: null,
    },
    colors: {
      type: [String],
      default: undefined,
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    thumbnail: {
      type: String,
      required: [true, "Product thumbnail is required"],
    },
    images: [String],
    category: { type: String, required: true },
    status: {
      type: String,
      default: null,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    stock: {
      type: Number,
      default: 5000,
      min: [0, "Stock cannot be negative"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    catelogue: {
      demo: String,
      type: String,
    },
    /*   shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  }, */
    views: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for discounted price
productSchema.virtual("discountedPrice").get(function () {
  return this.price - (this.price * this.discount) / 100;
});

module.exports = mongoose.model("Product", productSchema);
