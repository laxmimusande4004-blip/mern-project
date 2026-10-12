const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  createPaymentOrder,
  verifyPayment,
  getCustomerOrders,
} = require('../controllers/payment.controller');

const router = express.Router();

router.use(authMiddleware);
router.get('/orders', getCustomerOrders);
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

module.exports = router;
