const mongoose = require('mongoose');
const Product = require('../models/product.model');

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || !category || !image || price === undefined || stock === undefined) {
            return res.status(400).json({ message: 'All product fields are required.' });
        }

        const numericPrice = Number(price);
        const numericStock = Number(stock);

        if (Number.isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ message: 'Product price must be a number greater than 0.' });
        }

        if (Number.isNaN(numericStock) || numericStock < 0) {
            return res.status(400).json({ message: 'Product stock must be a number greater than or equal to 0.' });
        }

        const product = await Product.create({
            name,
            description,
            price: numericPrice,
            category,
            image,
            stock: numericStock,
        });

        return res.status(201).json(product);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }

        console.error('Create product error:', error);
        return res.status(500).json({ message: 'Server error while creating product.' });
    }
};

const getProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (category && category !== 'All Categories') {
            query.category = category;
        }

        const products = await Product.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        console.error('Get products error:', error);
        return res.status(500).json({ message: 'Server error while fetching products.' });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID.' });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.error('Get product by ID error:', error);
        return res.status(500).json({ message: 'Server error while fetching product.' });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
};
