require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing connection with URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('CONNECTED SUCCESSFULLY');
        process.exit(0);
    })
    .catch(err => {
        console.error('CONNECTION FAILED:', err.message);
        process.exit(1);
    });
