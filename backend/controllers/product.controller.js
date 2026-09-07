const { Product } = require('../models/Product');

async function listProducts(req, res, next) {
  try {
    const {
      search, category, minPrice, maxPrice,
      sort = '-createdAt', page = 1, limit = 12
    } = req.query;
    
    const filter = { isActive: true };
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) { 
    next(err); 
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) { 
    next(err); 
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) { 
    next(err); 
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) { 
    next(err); 
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deactivated', product });
  } catch (err) { 
    next(err); 
  }
}

async function updateStock(req, res, next) {
  try {
    const quantity = Number(req.body.quantity); 
    
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, stock: { $gte: -quantity } },
      { $inc: { stock: quantity } },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(409).json({ success: false, message: 'Insufficient stock' });
    }
    res.json({ success: true, message: 'Stock updated', stock: product.stock });
  } catch (err) { 
    next(err); 
  }
}

// Unified named exports at the bottom to remain uniform across the project
module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
};
