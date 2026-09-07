const router = require("express").Router();
const validate = require("../middleware/validate");
const rules = require("../validators/cart.validator");

// Destructured named imports matching your system convention
const { authenticate } = require("../middleware/auth");
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeCartItem 
} = require("../controllers/cart.controller");

router.get("/", authenticate, getCart);
router.post("/", authenticate, rules.addRules, validate, addToCart);
router.put("/:productId", authenticate, rules.quantityRules, validate, updateCartItem);
router.delete("/:productId", authenticate, removeCartItem);

module.exports = router;
