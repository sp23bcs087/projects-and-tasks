
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'beanimals-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    res.locals.cart = req.session.cart || [];
    next();
});

if (!process.env.MONGO_URI) {
    console.error('CRITICAL ERROR: MONGO_URI is missing in .env file');
    process.exit(1);
}

const startServer = async () => {
    try {
        console.log('Connecting to MongoDB Atlas... (This may take a moment)');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Successfully connected to MongoDB Atlas (Database: beanimals)');

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('CRITICAL ERROR: Could not connect to MongoDB Atlas.');
        console.error('Reason:', err.message);
        console.log('TIP: This usually means your IP address is not whitelisted in MongoDB Atlas.');
        console.log('Please check your Atlas dashboard -> Network Access.');
        process.exit(1);
    }
};

startServer();

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

app.get('/add-to-cart/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');

        if (!req.session.cart) req.session.cart = [];

        const cartItem = req.session.cart.find(item => item.productId === req.params.id);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            req.session.cart.push({
                productId: req.params.id,
                title: product.title,
                price: product.price,
                quantity: 1
            });
        }
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Error adding to cart');
    }
});

app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    res.render('cart', { title: 'Your Cart', cart, total });
});

app.get('/order/preview', (req, res) => {
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/cart');

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    res.render('order-preview', { title: 'Order Preview', cart, total });
});

app.post('/order/confirm', async (req, res) => {
    try {
        const cart = req.session.cart || [];
        if (cart.length === 0) return res.redirect('/cart');

        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        const newOrder = new Order({
            items: cart,
            totalAmount: total,
            status: 'Placed'
        });

        await newOrder.save();
        req.session.cart = [];
        res.render('order-success', { title: 'Order Success', order: newOrder });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error confirming order');
    }
});

app.use((req, res) => {
    res.status(404).render('404', { title: '404 - Page Not Found' });
});






