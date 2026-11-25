const mongoose = require('mongoose');

// Uploaded property photos are stored in MongoDB so they work on serverless
// hosting (Vercel has no persistent disk). Served from GET /api/images/:id.
const imageSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Image', imageSchema);
