const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGO_URL ||
    process.env.MONGO_PRIVATE_URL;

  if (!mongoUri) {
    throw new Error('No Mongo connection string found. Set one of: MONGO_URI, MONGODB_URI, DATABASE_URL, MONGO_URL, MONGO_PRIVATE_URL.');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 20000,
      maxPoolSize: 10
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;