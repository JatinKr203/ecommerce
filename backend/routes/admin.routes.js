const router = require("express").Router();

const { authenticate } = require("../middleware/auth");
const { authorizeAdmin } = require("../middleware/admin");
const { adminListOrders, updateOrderStatus } = require("../controllers/admin.controller");

// Chained authorization guards protecting administrative layers
router.get("/orders", authenticate, authorizeAdmin, adminListOrders);
router.put("/orders/:id/status", authenticate, authorizeAdmin, updateOrderStatus);

module.exports = router;
