
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;

        if (!uri) {
            console.log("No MONGODB_URI found. Starting embedded MongoDB Memory Server...");
            // Start embedded MongoDB
            const mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            console.log(`Embedded MongoDB started at: ${uri}`);
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
