const mongoose = require("mongoose");
const { Cart } = require("../models/Cart");
const { Product } = require("../models/Product");
const { Order } = require("../models/Order");

// POST Flow: Multi-document atomicity via MongoDB Transactions
async function createOrder(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ user: req.user.userId })
      .populate("items.product")
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    let totalAmount = 0;
    const items = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: "Product unavailable" });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}`
        });
      }

      totalAmount += product.price * item.quantity;
      
      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      // Update product inventory within transaction
      product.stock -= item.quantity;
      await product.save({ session });
    }

    const order = await Order.create(
      [{
        user: req.user.userId,
        items,
        totalAmount,
        shippingAddress: req.body.shippingAddress
      }],
      { session }
    );

    // Empty cart within transaction
    cart.items = [];
    await cart.save({ session });

    // Commit all changes to the database
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, order: order[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort("-createdAt");
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
}

async function getMyOrder(req, res, next) {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrder
};
