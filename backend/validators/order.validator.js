const { body } = require("express-validator");

const orderRules = [
  body("shippingAddress")
    .trim()
    .notEmpty()
    .withMessage("Shipping address is required")
];

const quantityRules = [
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1")
];


module.exports = {
  orderRules,
  quantityRules
};
