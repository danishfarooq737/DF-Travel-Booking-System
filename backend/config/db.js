const mongoose = require('mongoose');

/**
 * Connects to MongoDB using MONGODB_URI from environment variables.
 * Exits the process on failure so that a process manager (or the developer)
 * knows immediately that the API cannot start without a database.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // eslint-disable-next-line no-console
    console.error('FATAL: MONGODB_URI is not set in environment variables.');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri);
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
