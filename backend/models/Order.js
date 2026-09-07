const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product" 
    },
    name: String, 
    price: Number, 
    quantity: Number
  }],
  totalAmount: Number,
  shippingAddress: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order };
