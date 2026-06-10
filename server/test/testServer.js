const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { app } = require('../src/app');

async function createTestApp() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Ensure app/server code that uses env works
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';

  // Connect mongoose using the same helper as production code
  const { connectDB } = require('../src/config/db');
  await connectDB();

  return {
    app,
    mongod,
    cleanup: async () => {
      await mongoose.disconnect();
      await mongod.stop();
    },
  };
}

module.exports = { createTestApp };
