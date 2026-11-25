// Usage: npm run seed  (wipes and re-creates sample data in MONGODB_URI)
require('dotenv').config();
const { connectDB, disconnectDB } = require('./config/db');
const { seedDatabase } = require('./utils/seedData');

(async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('MONGODB_URI is not set. The in-memory database is seeded automatically when the server starts.');
      process.exit(0);
    }
    await connectDB();
    const { admin, created } = await seedDatabase({ reset: true });
    console.log(`🌱 Seeded ${created} properties. Admin login: ${admin.email}`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
})();
