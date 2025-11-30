const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  imgUrl: {
    type: String,
    required: [true, 'Banner image is required']
  },
  buttonText: {
    type: String,
    trim: true
  },
  buttonLink: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['hero', 'promo', 'category'],
    default: 'hero'
  },
  clickCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
//bannerSchema.index({ order: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
