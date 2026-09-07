const { body } = require("express-validator");

// Rules for adding a product to the cart (POST)
const addRules = [
  body("productId")
    .trim()
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid Product ID format"),
  
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be an integer of at least 1")
];

// Rules for updating an item's quantity (PUT)
const quantityRules = [
  body("quantity")
    .trim()
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be an integer of at least 1")
];

// Unified named exports matching your system convention
module.exports = {
  addRules,
  quantityRules
};
