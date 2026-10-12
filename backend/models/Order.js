const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  }],
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, required: true, default: 'INR' },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String, unique: true, sparse: true },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
