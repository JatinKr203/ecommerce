const router = require('express').Router();
const validate = require('../middleware/validate');
const { productRules, idRule } = require('../validators/product.validator');

// Destructured named imports matching your application convention
const { authenticate } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/admin');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} = require('../controllers/product.controller');

// Public endpoints
router.get('/', listProducts);
router.get('/:id', getProduct);

// Protected admin-only endpoints
router.post('/', authenticate, authorizeAdmin, productRules, validate, createProduct);
router.put('/:id', authenticate, authorizeAdmin, idRule, productRules, validate, updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, idRule, validate, deleteProduct);
router.patch('/:id/stock', authenticate, authorizeAdmin, idRule, validate, updateStock);

module.exports = router;
