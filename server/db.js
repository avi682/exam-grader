
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
        console.error(`MongoDB Connection Error: ${error.message}`);
        // In Serverless, we should NOT exit the process, because the function might be reused
        // or the connection issue might be temporary.
        // process.exit(1); 
        throw error; // Let the caller handle it or fail gracefully
    }
};

module.exports = connectDB;
