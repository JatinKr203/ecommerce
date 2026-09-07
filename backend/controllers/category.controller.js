const { Category } = require('../models/Category');

async function listCategories(req, res, next) {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.json({ success: true, categories });
  } catch (err) { 
    next(err); 
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (err) { 
    next(err); 
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, category });
  } catch (err) { 
    next(err); 
  }
}

async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id, 
      { isActive: false }, 
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, message: 'Category deactivated', category });
  } catch (err) { 
    next(err); 
  }
}

// Unified named exports at the bottom
module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
