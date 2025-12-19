
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

if (!process.env.MONGO_URI) {
    console.error('CRITICAL ERROR: MONGO_URI is missing in .env file');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas (Database: beanimals)'))
    .catch(err => {
        console.error('CRITICAL ERROR: Could not connect to MongoDB Atlas.');
        console.error('Reason:', err.message);
        console.log('TIP: Check your IP Whitelist in MongoDB Atlas and ensure the password is correct.');
        process.exit(1);
    });

app.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        const { category, minPrice, maxPrice } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        const totalProducts = await Product.countDocuments(query);
        const products = await Product.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalPages = Math.ceil(totalProducts / limit);

        res.render('index', {
            title: 'BeAnimals - Home',
            products,
            currentPage: page,
            totalPages,
            currentCategory: category || 'All',
            minPrice: minPrice || '',
            maxPrice: maxPrice || '',
            limit
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


app.get('/admin', async (req, res) => {
    try {
        const products = await Product.find();
        const totalProducts = products.length;
        const categories = [...new Set(products.map(p => p.category))];
        const totalValue = products.reduce((acc, curr) => acc + curr.price, 0);

        res.render('admin-dashboard', {
            title: 'Dashboard',
            totalProducts,
            categories,
            totalValue
        });
    } catch (err) {
        res.status(500).send('Admin Dashboard Error');
    }
});

app.get('/admin/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.render('admin-products', {
            title: 'Manage Products',
            products
        });
    } catch (err) {
        res.status(500).send('Error fetching products');
    }
});

app.get('/admin/products/new', (req, res) => {
    res.render('admin-product-form', {
        title: 'Add New Product',
        product: {} 
    });
});

app.post('/admin/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.redirect('/admin/products');
    } catch (err) {
        res.status(400).send('Error creating product');
    }
});

app.get('/admin/products/:id/edit', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');
        res.render('admin-product-form', {
            title: 'Edit Product',
            product
        });
    } catch (err) {
        res.status(500).send('Error fetching product');
    }
});

app.post('/admin/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/admin/products');
    } catch (err) {
        res.status(400).send('Error updating product');
    }
});

app.post('/admin/products/:id/delete', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin/products');
    } catch (err) {
        res.status(500).send('Error deleting product');
    }
});

app.get('/checkout', (req, res) => {
    res.render('checkout', { title: 'BeAnimals - Checkout' });
});

app.get('/crud', (req, res) => {
    res.render('crud', { title: 'BeAnimals - CRUD Blog' });
});

app.use((req, res) => {
    res.status(404).render('404', { title: '404 - Page Not Found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

