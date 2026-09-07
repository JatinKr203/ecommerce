const { Cart } = require("../models/Cart");
const { Product } = require("../models/Product");

// GET Flow: Find cart -> populate products -> calculate subtotal
async function getCart(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");
    
    if (!cart) {
      return res.json({ 
        success: true, 
        cart: { items: [] }, 
        subtotal: 0 
      });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity, 
      0
    );

    res.json({ success: true, cart, subtotal });
  } catch (err) { 
    next(err); 
  }
}

// POST Flow: Verify availability & stock -> add or increment item
async function addToCart(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;
    
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: "Product unavailable" 
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: "Insufficient stock" 
      });
    }

    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = await Cart.create({ user: req.user.userId, items: [] });
    }

    const item = cart.items.find(i => i.product.toString() === productId);
    if (item) {
      item.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(201).json({ success: true, cart });
  } catch (err) { 
    next(err); 
  }
}

async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: "Cart not found" 
      });
    }

    const item = cart.items.find(
      i => i.product.toString() === req.params.productId
    );
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found" 
      });
    }

    const product = await Product.findById(req.params.productId);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: "Insufficient stock" 
      });
    }

    item.quantity = quantity;
    await cart.save();
    
    res.json({ success: true, cart });
  } catch (err) { 
    next(err); 
  }
}

async function removeCartItem(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: "Cart not found" 
      });
    }

    cart.items = cart.items.filter(
      i => i.product.toString() !== req.params.productId
    );
    await cart.save();
    
    res.json({ success: true, cart });
  } catch (err) { 
    next(err); 
  }
}

// Ensure these are appended to your module.exports block:
module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
};
