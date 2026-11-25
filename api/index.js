// Vercel serverless entry point: every /api/* request is routed here (see vercel.json).
const app = require('../server/src/app');
const { ready } = require('../server/src/bootstrap');

module.exports = async (req, res) => {
  try {
    await ready();
  } catch (err) {
    console.error('Startup failed:', err.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ message: 'Server is not configured correctly' }));
  }
  return app(req, res);
};
