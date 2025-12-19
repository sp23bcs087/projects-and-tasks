
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', { title: 'BeAnimals - Home' });
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

