const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Product = require('../models/product.model');

const getRazorpay = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    const error = new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the backend.');
    error.status = 503;
    throw error;
  }
  return new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
};

const createPaymentOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay();
    const customer = await Customer.findById(req.user.id).populate({
      path: 'cart.product',
      select: 'name price stock',
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    if (!customer.cart.length) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const items = [];
    let amount = 0;
    for (const cartItem of customer.cart) {
      const product = cartItem.product;
      if (!product) {
        return res.status(400).json({ success: false, message: 'A product in your cart is no longer available.' });
      }
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `${product.name} no longer has enough stock. Update your cart and try again.`,
        });
      }

      const unitPricePaise = Math.round(product.price * 100);
      amount += unitPricePaise * cartItem.quantity;
      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });
    }

    if (!Number.isSafeInteger(amount) || amount < 1) {
      return res.status(400).json({ success: false, message: 'The cart total is invalid.' });
    }

    const gatewayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `shopkart_${new mongoose.Types.ObjectId()}`,
    });
    const order = await Order.create({
      customer: customer._id,
      items,
      amount,
      currency: 'INR',
      razorpayOrderId: gatewayOrder.id,
    });

    return res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      order: {
        id: gatewayOrder.id,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        receipt: gatewayOrder.receipt,
      },
      customer: {
        name: customer.fullName,
        email: customer.email,
        contact: customer.phoneNumber,
      },
      internalOrderId: order._id,
    });
  } catch (error) {
    if (error.status === 503) {
      return res.status(503).json({ success: false, message: error.message });
    }
    console.error('Create payment order error:', error);
    return res.status(500).json({ success: false, message: 'Unable to start checkout. Please try again.' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const razorpay = getRazorpay();
    const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    if (
      typeof razorpayOrderId !== 'string' || !razorpayOrderId ||
      typeof paymentId !== 'string' || !paymentId ||
      typeof signature !== 'string' || !signature
    ) {
      return res.status(400).json({ success: false, message: 'Payment verification details are incomplete.' });
    }

    const order = await Order.findOne({ razorpayOrderId, customer: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Payment order not found.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const receivedBuffer = Buffer.from(signature, 'hex');
    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({ success: false, message: 'Payment signature is invalid.' });
    }

    if (order.status === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment has already been verified.',
        orderId: order._id,
      });
    }

    const payment = await razorpay.payments.fetch(paymentId);
    if (
      payment.order_id !== order.razorpayOrderId ||
      payment.amount !== order.amount ||
      payment.currency !== order.currency ||
      payment.status !== 'captured'
    ) {
      return res.status(400).json({ success: false, message: 'Payment has not been captured for this order.' });
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const currentOrder = await Order.findOne({
          _id: order._id,
          status: 'pending',
        }).session(session);
        if (!currentOrder) return;

        for (const item of currentOrder.items) {
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true, session }
          );
          if (!updatedProduct) {
            throw new Error(`Insufficient stock while completing order for ${item.name}.`);
          }
        }

        currentOrder.status = 'paid';
        currentOrder.razorpayPaymentId = paymentId;
        await currentOrder.save({ session });

        const currentCustomer = await Customer.findById(req.user.id).session(session);
        if (currentCustomer) {
          currentCustomer.cart = currentCustomer.cart.filter(
            (cartItem) => !currentOrder.items.some(
              (orderItem) => orderItem.product.equals(cartItem.product)
            )
          );
          await currentCustomer.save({ session });
        }
      });
    } finally {
      await session.endSession();
    }

    const confirmedOrder = await Order.findById(order._id);
    if (confirmedOrder.status !== 'paid') {
      return res.status(409).json({
        success: false,
        message: 'This payment was already processed. Refresh your orders before retrying.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      orderId: confirmedOrder._id,
    });
  } catch (error) {
    if (error.status === 503) {
      return res.status(503).json({ success: false, message: error.message });
    }
    if (error.message?.startsWith('Insufficient stock')) {
      return res.status(409).json({ success: false, message: 'Payment was captured, but stock changed. Contact support for a refund.' });
    }
    console.error('Verify payment error:', error);
    return res.status(500).json({ success: false, message: 'Unable to verify payment. Please contact support before retrying.' });
  }
};

const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Get customer orders error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load your orders.' });
  }
};

module.exports = { createPaymentOrder, verifyPayment, getCustomerOrders };
