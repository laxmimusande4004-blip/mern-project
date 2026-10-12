const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Product = require('../models/product.model');

const getPopulatedCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: 'cart.product',
    select: 'name description price category image stock',
  });

  if (!customer) return null;
  return customer.cart
    .filter((item) => item.product)
    .map((item) => ({ product: item.product, quantity: item.quantity }));
};

const sendCart = async (res, customerId, message) => {
  const cart = await getPopulatedCart(customerId);
  if (cart === null) {
    return res.status(404).json({ success: false, message: 'Customer not found.' });
  }

  return res.status(200).json({ success: true, message, cart });
};

const addProductToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const cartItem = customer.cart.find((item) => item.product.toString() === productId);
    const nextQuantity = (cartItem?.quantity || 0) + 1;
    if (nextQuantity > product.stock) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock.' });
    }

    if (cartItem) {
      cartItem.quantity = nextQuantity;
    } else {
      customer.cart.push({ product: product._id, quantity: 1 });
    }
    await customer.save();

    return await sendCart(res, customer._id, 'Cart updated');
  } catch (error) {
    console.error('Add product to cart error:', error);
    return res.status(500).json({ success: false, message: 'Server error while adding product to cart.' });
  }
};

const getCart = async (req, res) => {
  try {
    return await sendCart(res, req.user.id);
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching cart.' });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be an integer greater than or equal to 1.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock.' });
    }

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const cartItem = customer.cart.find((item) => item.product.toString() === productId);
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Product is not in the cart.' });
    }

    cartItem.quantity = quantity;
    await customer.save();

    return await sendCart(res, customer._id, 'Cart updated');
  } catch (error) {
    console.error('Update cart quantity error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating cart.' });
  }
};

const removeProductFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const cartItemExists = customer.cart.some((item) => item.product.toString() === productId);
    if (!cartItemExists) {
      return res.status(404).json({ success: false, message: 'Product is not in the cart.' });
    }

    customer.cart = customer.cart.filter((item) => item.product.toString() !== productId);
    await customer.save();

    return await sendCart(res, customer._id, 'Product removed from cart');
  } catch (error) {
    console.error('Remove product from cart error:', error);
    return res.status(500).json({ success: false, message: 'Server error while removing product from cart.' });
  }
};

module.exports = {
  addProductToCart,
  getCart,
  updateCartQuantity,
  removeProductFromCart,
};
