const { connectDB } = require('./config/db');
const { seedDatabase } = require('./utils/seedData');

let readyPromise = null;

/**
 * Connects to MongoDB and makes sure the admin account (and sample data on an
 * empty database) exist. Runs once per process – on Vercel, once per cold start.
 */
function ready() {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return Promise.reject(new Error('JWT_SECRET must be set in production'));
    }
    process.env.JWT_SECRET = 'dev-only-secret-change-me';
  }

  if (!readyPromise) {
    readyPromise = (async () => {
      const { inMemory } = await connectDB();
      const { admin, created } = await seedDatabase();
      if (created) console.log(`🌱 Added ${created} sample properties${inMemory ? ' to the in-memory DB' : ''}.`);
      console.log(`🔑 Admin login: ${admin.email}`);
    })().catch((err) => {
      readyPromise = null; // allow a retry on the next request
      throw err;
    });
  }
  return readyPromise;
}

module.exports = { ready };
