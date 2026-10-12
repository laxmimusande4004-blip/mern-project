const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  addProductToCart,
  getCart,
  updateCartQuantity,
  removeProductFromCart,
} = require('../controllers/cart.controller');

const router = express.Router();

router.use(authMiddleware);
router.post('/:productId', addProductToCart);
router.get('/', getCart);
router.patch('/:productId', updateCartQuantity);
router.delete('/:productId', removeProductFromCart);

module.exports = router;
