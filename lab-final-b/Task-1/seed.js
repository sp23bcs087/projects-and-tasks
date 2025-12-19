const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
    {
        name: 'Premium Dog Food',
        price: 40.00,
        category: 'Dogs',
        image: '/assets/flex_box_dog.jpg',
        description: 'High-quality nutritious food for adult dogs.'
    },
    {
        name: 'Catnip Toy Set',
        price: 15.50,
        category: 'Cats',
        image: '/assets/flex_box_cat1.jpg',
        description: 'Set of 3 interactive catnip toys for your feline friend.'
    },
    {
        name: 'Cozy Pet Bed',
        price: 25.00,
        category: 'Dogs',
        image: '/assets/flex_box_dog2.jpg',
        description: 'Soft and warm bed suitable for small to medium pets.'
    },
    {
        name: 'Golden Retriever Grooming Kit',
        price: 35.00,
        category: 'Dogs',
        image: '/assets/flex_box_dog3.jpg',
        description: 'Complete grooming set for long-haired dog breeds.'
    },
    {
        name: 'Interactive Parrot Perch',
        price: 20.00,
        category: 'Birds',
        image: '/assets/home_animals_parrot.jpg',
        description: 'Natural wood perch for parrots and other large birds.'
    },
    {
        name: 'Automatic Cat Feeder',
        price: 55.00,
        category: 'Cats',
        image: '/assets/flex_box_cat2.jpg',
        description: 'Programmable feeder to keep your cat on a healthy schedule.'
    },
    {
        name: 'Luxury Cat Scratching Post',
        price: 45.00,
        category: 'Cats',
        image: '/assets/flex_box_cat3.jpg',
        description: 'Tall scratching post with perches and integrated toys.'
    },
    {
        name: 'Safe-Walk Dog Harness',
        price: 22.00,
        category: 'Dogs',
        image: '/assets/home_animals_slide1.jpg',
        description: 'Reflective no-pull harness for safe nighttime walks.'
    },
    {
        name: 'Bird Seed Variety Pack',
        price: 12.00,
        category: 'Birds',
        image: '/assets/home_animals_slide2.jpg',
        description: 'Blend of seeds and nuts for various wild and pet birds.'
    },
    {
        name: 'Pet Travel Carrier',
        price: 30.00,
        category: 'Accessories',
        image: '/assets/home_animals_dog_in_frame.jpg',
        description: 'Airline-approved carrier for small dogs and cats.'
    },
    {
        name: 'Eco-Friendly Litter Box',
        price: 18.00,
        category: 'Cats',
        image: '/assets/home_animals_cat_with_frame.jpg',
        description: 'Large litter box made from recycled materials.'
    },
    {
        name: 'Dental Chew Bones (7pk)',
        price: 10.00,
        category: 'Dogs',
        image: '/assets/flex_box_dog.jpg',
        description: 'Daily treats that help clean teeth and freshen breath.'
    }
];

const seedDB = async (connStr) => {
    try {
        await mongoose.connect(connStr);
        console.log('Database connected for seeding...');

        await Product.deleteMany({});
        console.log('Old products removed.');

        await Product.insertMany(products);
        console.log('Sample products seeded successfully!');

        await mongoose.connection.close();
        console.log('Database connection closed.');
    } catch (err) {
        console.error('Error seeding database:', err);
    }
};

if (process.argv[2]) {
    seedDB(process.argv[2]);
} else {
    console.log('Please provide a MongoDB connection string as an argument.');
    console.log('Example: node seed.js "mongodb://localhost:27017/beanimals"');
}




