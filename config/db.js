const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const local = process.env.MONGODB_URI;

const connect = async () => {
    try {
        await mongoose.connect(local);
        console.log('Connect success');
    } catch (error) {
        console.error('Connection to MongoDB failed:', error);
    }
}

module.exports = { connect };
