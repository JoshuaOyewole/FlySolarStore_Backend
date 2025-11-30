const { body, validationResult } = require('express-validator');
const { AppError } = require('../utils/appError');

const validateBanner = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('imgUrl')
    .trim()
    .notEmpty()
    .withMessage('Image URL is required'),
  
  body('description')
    .optional()
    .trim(),
  
  body('buttonText')
    .optional()
    .trim(),
  
  body('buttonLink')
    .optional()
    .trim(),
  
  body('backgroundColor')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Background color must be a valid hex color'),
  
  body('textColor')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Text color must be a valid hex color'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer'),
  
  body('targetAudience')
    .optional()
    .trim()
    .isIn(['all', 'new-users', 'premium-users', 'returning-users'])
    .withMessage('Invalid target audience'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('isCurrentlyActive')
    .optional()
    .isBoolean()
    .withMessage('isCurrentlyActive must be a boolean'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return next(new AppError(errorMessages, 400));
    }
    next();
  }
];

module.exports = {
  validateBanner
};
