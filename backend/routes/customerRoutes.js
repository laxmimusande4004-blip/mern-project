const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database unavailable. Add your IP to MongoDB Atlas Network Access or start a local MongoDB instance.'
    });
  }
  return next();
};

router.use(requireDatabase);

// @route   POST /customers/register
// @desc    Register a new customer
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    // Validate request
    if (!fullName || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new customer
    const newCustomer = new Customer({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber
    });

    await newCustomer.save();
    res.status(201).json({ message: 'Customer registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /customers/login
// @desc    Authenticate user & get token (login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' });
    }

    // Check for customer
    const customer = await Customer.findOne({ email });
    if (!customer) {
      // Return 401 specifically requested by lab for "Invalid Credentials"
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    // Create JWT Payload
    const payload = {
      id: customer._id
    };

    // Sign Token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Send token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({ message: 'Logged in successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /customers/me
// @desc    Get logged in customer details
// @access  Protected
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is set in the auth middleware from the JWT token
    const customer = await Customer.findById(req.user.id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @route   POST /customers/logout
// @desc    Logout user and clear cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
