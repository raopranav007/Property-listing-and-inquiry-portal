require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./utils/seedData');

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET must be set in production');
    process.exit(1);
  }
  process.env.JWT_SECRET = 'dev-only-secret-change-me';
}

// SERVER_PORT wins over PORT so tools that inject PORT for the frontend don't clash
const PORT = process.env.SERVER_PORT || process.env.PORT || 5000;

(async () => {
  try {
    const { inMemory } = await connectDB();
    // Create the admin account (and sample listings if the DB is empty)
    const { admin, created } = await seedDatabase();
    if (created) console.log(`🌱 Added ${created} sample properties${inMemory ? ' to the in-memory DB' : ''}.`);
    console.log(`🔑 Admin login: ${admin.email}`);

    app.listen(PORT, () => console.log(`🚀 API running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();
