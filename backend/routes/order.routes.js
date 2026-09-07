const router = require("express").Router();
const validate = require("../middleware/validate");
const rules = require("../validators/order.validator");

// Destructured named imports matching your application convention
const { authenticate } = require("../middleware/auth");
const { 
  createOrder, 
  getMyOrders, 
  getMyOrder 
} = require("../controllers/order.controller");

router.post("/", authenticate, rules.orderRules, validate, createOrder);
router.get("/", authenticate, getMyOrders);
router.get("/:id", authenticate, getMyOrder);

module.exports = router;
