require('dotenv').config();
const app = require('./app');
const { ready } = require('./bootstrap');

// SERVER_PORT wins over PORT so tools that inject PORT for the frontend don't clash
const PORT = process.env.SERVER_PORT || process.env.PORT || 5000;

ready()
  .then(() => app.listen(PORT, () => console.log(`🚀 API running at http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
