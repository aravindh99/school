const { body, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// School validation rules
const validateSchool = [
  body('name')
    .trim()
    .isLength({ min: 7, max: 39 })
    .withMessage('School name must be between 7 and 39 characters'),
  body('city')
    .trim()
    .isLength({ min: 3, max: 14 })
    .withMessage('City must be between 3 and 14 characters'),
  handleValidationErrors
];

// Rumor validation rules
const validateRumor = [
  body('class')
    .isIn(['7', '8', '9', '10', '11', '12'])
    .withMessage('Invalid class selection'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  handleValidationErrors
];

module.exports = {
  validateSchool,
  validateRumor,
  handleValidationErrors
};