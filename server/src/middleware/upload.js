const multer = require('multer');

// Kept in memory and saved to MongoDB. 4 MB stays under Vercel's 4.5 MB request limit.
const MAX_SIZE = 4 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG, WEBP or GIF images are allowed'), ok);
  },
});

module.exports = { upload, MAX_SIZE };
