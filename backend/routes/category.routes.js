const router = require('express').Router();

// Destructured named imports matching your application convention
const { authenticate } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/admin');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');

// Public endpoint
router.get('/', listCategories);

// Protected admin-only endpoints
router.post('/', authenticate, authorizeAdmin, createCategory);
router.put('/:id', authenticate, authorizeAdmin, updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, deleteCategory);

module.exports = router;
