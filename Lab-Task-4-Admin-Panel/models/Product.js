const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['Cats', 'Dogs', 'Birds', 'Accessories']
    },
    image: {
        type: String,
        default: '/assets/placeholder.jpg'
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

