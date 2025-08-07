const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
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

/**
 * Validation rules for petition submission
 */
const validatePetitionSubmission = [
  body('from_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.]+$/)
    .withMessage('Name can only contain letters, spaces, and dots'),
  
  body('to_department')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters'),
  
  body('whatsapp_number')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian mobile number'),
  
  body('petition_text')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Petition text must be between 10 and 5000 characters'),
  
  handleValidationErrors
];

/**
 * Validation rules for petition status update
 */
const validateStatusUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid petition ID'),
  
  body('status')
    .isIn(['pending', 'in_progress', 'resolved', 'rejected'])
    .withMessage('Invalid status value'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority value'),
  
  handleValidationErrors
];

/**
 * Validation rules for response submission
 */
const validateResponseSubmission = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid petition ID'),
  
  body('response_text')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Response text must be between 10 and 2000 characters'),
  
  body('is_final')
    .optional()
    .isBoolean()
    .withMessage('is_final must be a boolean value'),
  
  handleValidationErrors
];

/**
 * Validation rules for login
 */
const validateLogin = [
  body('role')
    .isIn(['official', 'admin'])
    .withMessage('Invalid role'),
  
  body('code')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Login code is required'),
  
  handleValidationErrors
];

/**
 * Validation rules for petition tracking
 */
const validatePetitionTracking = [
  param('petition_id')
    .matches(/^TNK-\d{4}-\d{3}$/)
    .withMessage('Invalid petition ID format'),
  
  handleValidationErrors
];

/**
 * Validation rules for petition queries
 */
const validatePetitionQuery = [
  query('status')
    .optional()
    .isIn(['pending', 'in_progress', 'resolved', 'rejected'])
    .withMessage('Invalid status filter'),
  
  query('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department filter too long'),
  
  query('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority filter'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

module.exports = {
  validatePetitionSubmission,
  validateStatusUpdate,
  validateResponseSubmission,
  validateLogin,
  validatePetitionTracking,
  validatePetitionQuery,
  handleValidationErrors
};