const { body, param } = require('express-validator');

const productRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
    
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be >= 0'),
    
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be >= 0'),
    
  body('sku')
    .notEmpty()
    .withMessage('SKU is required'),
    
  body('category')
    .isMongoId()
    .withMessage('category must be a valid id')
];

const idRule = [ 
  param('id')
    .isMongoId()
    .withMessage('Invalid id') 
];

// Unified named exports at the bottom
module.exports = {
  productRules,
  idRule
};
