const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    unique: true 
  },
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product" 
    },
    quantity: { 
      type: Number, 
      min: 1, 
      required: true 
    }
  }]
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);

module.exports = { Cart };
