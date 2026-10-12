const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Product = require('../models/product.model');

const addProductToWishlist = async (req, res) => {
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

    const alreadySaved = customer.wishlist.some((item) => item.toString() === productId);
    if (alreadySaved) {
      return res.status(409).json({ success: false, message: 'Product already in wishlist.' });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    console.error('Add product to wishlist error:', error);
    return res.status(500).json({ success: false, message: 'Server error while saving product.' });
  }
};

const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).populate({
      path: 'wishlist',
      select: 'name price category image stock',
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching wishlist.' });
  }
};

const removeProductFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const productExistsInWishlist = customer.wishlist.some((item) => item.toString() === productId);
    if (!productExistsInWishlist) {
      return res.status(404).json({ success: false, message: 'Product not in wishlist.' });
    }

    customer.wishlist = customer.wishlist.filter((item) => item.toString() !== productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    console.error('Remove product from wishlist error:', error);
    return res.status(500).json({ success: false, message: 'Server error while removing product.' });
  }
};

module.exports = {
  addProductToWishlist,
  getWishlist,
  removeProductFromWishlist,
};
