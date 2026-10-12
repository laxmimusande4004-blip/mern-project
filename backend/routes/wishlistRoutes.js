const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  addProductToWishlist,
  getWishlist,
  removeProductFromWishlist,
} = require('../controllers/wishlist.controller');

const router = express.Router();

router.use(authMiddleware);
router.post('/:productId', addProductToWishlist);
router.get('/', getWishlist);
router.delete('/:productId', removeProductFromWishlist);

module.exports = router;
