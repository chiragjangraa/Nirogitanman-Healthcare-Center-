const mongoose = require('mongoose');

const dbState = {
  isMock: false
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nirogitanman');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    dbState.isMock = false;
  } catch (error) {
    console.warn('==================================================');
    console.warn('WARNING: Failed to connect to MongoDB server.');
    console.warn('Reason:', error.message);
    console.warn('Running server in MOCK DATABASE mode (JSON files).');
    console.warn('CRUD operations will work using server/config/mock-db-data.json');
    console.warn('==================================================');
    dbState.isMock = true;
  }
};

module.exports = { connectDB, dbState };
