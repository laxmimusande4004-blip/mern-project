const express = require('express');
const mongoose = require('mongoose');
const { createProduct, getProducts, getProductById } = require('../controllers/product.controller');

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
router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;
