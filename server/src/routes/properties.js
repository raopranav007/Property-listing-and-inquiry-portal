const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const { protect } = require('../middleware/auth');
const { upload, UPLOAD_DIR } = require('../middleware/upload');

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Builds a MongoDB filter from query-string params (search + filters). */
function buildFilter(q) {
  const filter = {};
  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q.trim()), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { 'location.locality': rx }, { 'location.city': rx }];
  }
  if (q.city) filter['location.city'] = new RegExp(`^${escapeRegex(q.city)}$`, 'i');
  if (q.locality) filter['location.locality'] = new RegExp(escapeRegex(q.locality), 'i');
  if (q.propertyType) filter.propertyType = { $in: q.propertyType.split(',') };
  if (q.listingType) filter.listingType = q.listingType;
  if (q.availability) filter.availability = { $in: q.availability.split(',') };
  if (q.bedrooms) filter.bedrooms = { $gte: Number(q.bedrooms) };
  if (q.minPrice || q.maxPrice) {
    filter.price = {};
    if (q.minPrice) filter.price.$gte = Number(q.minPrice);
    if (q.maxPrice) filter.price.$lte = Number(q.maxPrice);
  }
  if (q.featured === 'true') filter.featured = true;
  return filter;
}

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  area_desc: { areaSqft: -1 },
};

// GET /api/properties  – public search & filter with pagination
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 9));
    const filter = buildFilter(req.query);
    const sort = SORTS[req.query.sort] || SORTS.newest;

    const [items, total] = await Promise.all([
      Property.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Property.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    next(err);
  }
});

// GET /api/properties/meta  – values for the filter dropdowns
router.get('/meta', async (req, res, next) => {
  try {
    const [cities, priceRange] = await Promise.all([
      Property.distinct('location.city'),
      Property.aggregate([{ $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }]),
    ]);
    res.json({
      cities: cities.sort(),
      propertyTypes: Property.PROPERTY_TYPES,
      listingTypes: Property.LISTING_TYPES,
      availability: Property.AVAILABILITY,
      priceRange: priceRange[0] ? { min: priceRange[0].min, max: priceRange[0].max } : { min: 0, max: 0 },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/properties/:id  – property details (+ similar listings)
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Property not found' });
    const property = await Property.findById(req.params.id).lean();
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const similar = await Property.find({
      _id: { $ne: property._id },
      'location.city': property.location.city,
      listingType: property.listingType,
    })
      .limit(3)
      .lean();
    res.json({ property, similar });
  } catch (err) {
    next(err);
  }
});

/* ---------- Admin (protected) ---------- */

/** Multipart requests send listing fields as JSON in a "data" field plus "images" files. */
function readPayload(req) {
  let data = req.body;
  if (typeof req.body.data === 'string') {
    try {
      data = JSON.parse(req.body.data);
    } catch {
      const err = new Error('Invalid listing data');
      err.status = 400;
      throw err;
    }
  }
  const uploaded = (req.files || []).map((f) => `/uploads/${f.filename}`);
  const kept = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
  const allowed = [
    'title', 'description', 'price', 'listingType', 'propertyType', 'availability', 'location',
    'bedrooms', 'bathrooms', 'areaSqft', 'furnishing', 'amenities', 'featured',
  ];
  const payload = {};
  for (const key of allowed) if (data[key] !== undefined) payload[key] = data[key];
  payload.images = [...kept, ...uploaded];
  return payload;
}

function removeLocalImages(urls) {
  for (const url of urls) {
    if (!url.startsWith('/uploads/')) continue;
    const file = path.join(UPLOAD_DIR, path.basename(url));
    fs.promises.unlink(file).catch(() => {});
  }
}

// POST /api/properties  – add a listing
router.post('/', protect, upload.array('images', 8), async (req, res, next) => {
  try {
    const payload = readPayload(req);
    const property = await Property.create({ ...payload, createdBy: req.user._id });
    res.status(201).json(property);
  } catch (err) {
    next(err);
  }
});

// PUT /api/properties/:id  – update a listing
router.put('/:id', protect, upload.array('images', 8), async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const payload = readPayload(req);
    const removed = property.images.filter((img) => !payload.images.includes(img));
    property.set(payload);
    await property.save();
    removeLocalImages(removed);
    res.json(property);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/properties/:id/availability  – quick status change
router.patch('/:id/availability', protect, async (req, res, next) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { availability: req.body.availability },
      { new: true, runValidators: true }
    );
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/properties/:id  – remove a listing (and its inquiries)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    await Inquiry.deleteMany({ property: property._id });
    removeLocalImages(property.images);
    res.json({ message: 'Listing removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
