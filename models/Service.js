const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true
  },
  icon: {
    type: String,
    required: [true, 'Icon is required'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: null,
    maxLength: [300, 'Description cannot exceed 300 characters']
  },
  position: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save hook to generate id from _id
serviceSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();
  }
  next();
});

// Indexes
serviceSchema.index({ position: 1, isActive: 1 });
serviceSchema.index({ id: 1 }, { unique: true });

module.exports = mongoose.model('Service', serviceSchema);
