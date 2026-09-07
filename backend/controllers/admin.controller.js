const { Order } = require("../models/Order");

async function adminListOrders(req, res, next) {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort("-createdAt");
      
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    const { status } = req.body;

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  adminListOrders,
  updateOrderStatus
};
