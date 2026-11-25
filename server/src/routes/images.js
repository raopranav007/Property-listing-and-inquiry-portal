const express = require('express');
const mongoose = require('mongoose');
const Image = require('../models/Image');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// POST /api/images  – admin uploads one photo (form field "image"), returns its URL
router.post('/', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image received' });
    const image = await Image.create({
      data: req.file.buffer,
      contentType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
    });
    res.status(201).json({ url: `/api/images/${image._id}` });
  } catch (err) {
    next(err);
  }
});

// GET /api/images/:id  – public, cached by browsers and the CDN
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();
    const image = await Image.findById(req.params.id).lean();
    if (!image) return res.status(404).end();
    res.set('Content-Type', image.contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(image.data.buffer ? Buffer.from(image.data.buffer) : image.data);
  } catch (err) {
    next(err);
  }
});

/** Deletes stored images referenced by /api/images/:id URLs. */
async function deleteStoredImages(urls) {
  const ids = urls
    .map((u) => (u.match(/^\/api\/images\/([a-f0-9]{24})$/) || [])[1])
    .filter(Boolean);
  if (ids.length) await Image.deleteMany({ _id: { $in: ids } });
}

module.exports = router;
module.exports.deleteStoredImages = deleteStoredImages;
