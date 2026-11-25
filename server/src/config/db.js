const mongoose = require('mongoose');

let memoryServer = null;

/**
 * Connects to MongoDB.
 * - If MONGODB_URI is set, it is used (local MongoDB or MongoDB Atlas).
 * - Otherwise, in development, an in-memory MongoDB is started automatically
 *   so the project runs out of the box (data resets on restart).
 */
async function connectDB() {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error('MONGODB_URI must be set in production');
    }
    // Dev-only dependency; the variable keeps serverless bundlers from packaging it
    const devPkg = 'mongodb-memory-server';
    const { MongoMemoryServer } = require(devPkg);
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('property_portal');
    console.log('⚠️  MONGODB_URI not set – using an in-memory MongoDB (data is not persisted).');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  return { inMemory: Boolean(memoryServer) };
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connectDB, disconnectDB };
