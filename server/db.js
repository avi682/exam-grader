
const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;

        if (!uri) {
            console.log("No MONGODB_URI found. Attempting to start embedded MongoDB Memory Server...");
            // Only require it if we absolutely need it (Lazy Load)
            // This prevents "Module not found" crashes in production where this dev-dependency is missing.
            try {
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongod = await MongoMemoryServer.create();
                uri = mongod.getUri();
                console.log(`Embedded MongoDB started at: ${uri}`);
            } catch (err) {
                console.error("Failed to start embedded MongoDB. Make sure 'mongodb-memory-server' is installed or set MONGODB_URI.", err.message);
                throw new Error("Missing MONGODB_URI and cannot start embedded DB.");
            }
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
