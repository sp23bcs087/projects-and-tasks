
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

