const mongoose = require('mongoose');

async function connectDB() {
  const connectionString = process.env.connectionString;

  try {
    await mongoose.connect(connectionString);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
