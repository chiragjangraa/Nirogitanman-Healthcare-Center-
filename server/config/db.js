// db.js — supports optional Mongoose, falls back to JSON mock DB
// MongoDB is optional. If not available, the server uses the JSON file-based mock DB.

const dbState = {
  isMock: true  // Default to mock; set to false if Mongoose connects
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('================================================');
    console.warn('INFO: MONGODB_URI not set in .env');
    console.warn('Running server in MOCK DATABASE mode (JSON files).');
    console.warn('Data is stored in: server/config/mock-db-data.json');
    console.warn('================================================');
    dbState.isMock = true;
    return;
  }

  try {
    const mongoose = require('mongoose');
    const conn = await mongoose.connect(mongoUri);
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    dbState.isMock = false;
  } catch (error) {
    console.warn('================================================');
    console.warn('WARNING: Failed to connect to MongoDB.');
    console.warn('Reason:', error.message);
    console.warn('Running server in MOCK DATABASE mode (JSON files).');
    console.warn('================================================');
    dbState.isMock = true;
  }
};

module.exports = { connectDB, dbState };
