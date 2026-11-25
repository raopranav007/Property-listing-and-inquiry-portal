const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');

const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const inquiryRoutes = require('./routes/inquiries');
const { UPLOAD_DIR } = require('./middleware/upload');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Static files: uploaded property images + bundled sample images
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/samples', express.static(path.join(__dirname, '..', 'public', 'samples')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Serve the built React app in production (client/dist)
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api|\/uploads|\/samples).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || /images are allowed/.test(err.message)) {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ message: first ? first.message : 'Invalid data' });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: `Invalid ${err.path}` });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Something went wrong on the server' : err.message });
});

module.exports = app;
