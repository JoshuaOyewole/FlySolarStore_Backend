const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  content: {
    type: String
  },
  thumbnail: {
    type: String,
    required: [true, 'Blog thumbnail is required']
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: String,
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  readTime: {
    type: Number,
    default: 5
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save hook to generate id from _id
blogSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();
  }
  next();
});

// Indexes
blogSchema.index({ slug: 1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ id: 1 }, { unique: true });

module.exports = mongoose.model('Blog', blogSchema);
