const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const validateBanner = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('buttonText')
    .optional()
    .trim(),
  
  body('buttonLink')
    .optional()
    .trim(),
  
  body('type')
    .optional()
    .trim()
    .isIn(['hero', 'promo', 'category'])
    .withMessage('Type must be one of: hero, promo, category'),

  // Validation result handler
  (req, res, next) => {
    // Check for unexpected fields
    const allowedFields = ['title', 'description', 'buttonText', 'buttonLink', 'type'];
    const bodyFields = Object.keys(req.body);
    const unexpectedFields = bodyFields.filter(field => !allowedFields.includes(field));
    
    if (unexpectedFields.length > 0) {
      return next(new AppError(`Unexpected fields: ${unexpectedFields.join(', ')}`, 400));
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return next(new AppError(errorMessages, 400));
    }
    next();
  }
];

const validateBannerUpdate = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('buttonText')
    .optional()
    .trim(),
  
  body('buttonLink')
    .optional()
    .trim(),
  
  body('type')
    .optional()
    .trim()
    .isIn(['hero', 'promo', 'category'])
    .withMessage('Type must be one of: hero, promo, category'),

  // Validation result handler
  (req, res, next) => {
    // Check for unexpected fields
    const allowedFields = ['title', 'description', 'buttonText', 'buttonLink', 'type'];
    const bodyFields = Object.keys(req.body);
    const unexpectedFields = bodyFields.filter(field => !allowedFields.includes(field));
    
    if (unexpectedFields.length > 0) {
      return next(new AppError(`Unexpected fields: ${unexpectedFields.join(', ')}`, 400));
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return next(new AppError(errorMessages, 400));
    }
    next();
  }
];

module.exports = {
  validateBanner,
  validateBannerUpdate
};
