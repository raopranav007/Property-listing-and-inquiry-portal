const express = require('express');
const { body } = require('express-validator');
const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/inquiries  – public: customer submits an inquiry for a property
router.post(
  '/',
  [
    body('property').custom((v) => mongoose.isValidObjectId(v)).withMessage('Invalid property'),
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Please enter your name'),
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('phone')
      .trim()
      .matches(/^[+]?[\d\s-]{10,15}$/)
      .withMessage('Please enter a valid phone number'),
    body('message').trim().isLength({ min: 5, max: 1500 }).withMessage('Message must be 5–1500 characters'),
    body('preferredContact').optional().isIn(['Phone', 'Email', 'WhatsApp']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const property = await Property.findById(req.body.property);
      if (!property) return res.status(404).json({ message: 'Property not found' });

      const { name, email, phone, message, preferredContact } = req.body;
      const inquiry = await Inquiry.create({ property: property._id, name, email, phone, message, preferredContact });
      res.status(201).json({ message: 'Inquiry submitted! The broker will contact you soon.', id: inquiry._id });
    } catch (err) {
      next(err);
    }
  }
);

/* ---------- Admin (protected) ---------- */
router.use(protect);

// GET /api/inquiries  – list with filters
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.property) filter.property = req.query.property;
    if (req.query.q) {
      const rx = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { message: rx }];
    }
    const items = await Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .populate('property', 'title location price listingType images')
      .lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// GET /api/inquiries/stats  – dashboard counters
router.get('/stats', async (req, res, next) => {
  try {
    const [byStatus, totalProperties, byAvailability] = await Promise.all([
      Inquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Property.countDocuments(),
      Property.aggregate([{ $group: { _id: '$availability', count: { $sum: 1 } } }]),
    ]);
    const toObj = (arr) => Object.fromEntries(arr.map((x) => [x._id, x.count]));
    const inquiries = toObj(byStatus);
    res.json({
      totalProperties,
      availability: toObj(byAvailability),
      inquiries,
      totalInquiries: Object.values(inquiries).reduce((a, b) => a + b, 0),
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/inquiries/:id  – update status and/or add a response note
router.patch(
  '/:id',
  [
    body('status').optional().isIn(Inquiry.INQUIRY_STATUS).withMessage('Invalid status'),
    body('note').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Note must be 1–1000 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const inquiry = await Inquiry.findById(req.params.id);
      if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
      if (req.body.status) inquiry.status = req.body.status;
      if (req.body.note) inquiry.notes.push({ text: req.body.note, author: req.user.name });
      await inquiry.save();
      await inquiry.populate('property', 'title location price listingType images');
      res.json(inquiry);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/inquiries/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    res.json({ message: 'Inquiry deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
