require('dotenv').config();
const dns = require('dns');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const cartRoutes = require('./routes/cart.routes');
const paymentRoutes = require('./routes/payment.routes');

// Use public DNS for MongoDB Atlas SRV records when the local resolver refuses them.
dns.setServers(['1.1.1.1', '8.8.8.8']);

const app = express();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';

// Middleware
// Enable CORS for the frontend Vite server
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ],
  credentials: true, // Allow cookies to be sent back and forth
}));
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies from headers

app.get('/health', (req, res) => {
  res.json({
    ok: mongoose.connection.readyState === 1,
    message: mongoose.connection.readyState === 1
      ? 'MongoDB connected'
      : 'MongoDB not connected'
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB Connected Successfully!');
    return true;
  } catch (err) {
    console.error('MongoDB Connection Error: ', err.message);
    console.error('Fix: add your current IP to MongoDB Atlas Network Access, or run a local MongoDB server at mongodb://127.0.0.1:27017/shopkart.');
    return false;
  }
};

connectDB().then((connected) => {
  app.locals.dbConnected = connected;
  if (!connected) {
    console.log('Backend started in degraded mode. Database features will not work until MongoDB is reachable.');
  }
});

// Routes
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/payments', paymentRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
