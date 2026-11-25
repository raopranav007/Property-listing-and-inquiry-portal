const mongoose = require('mongoose');

const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Plot', 'Commercial', 'PG'];
const LISTING_TYPES = ['Sale', 'Rent'];
const AVAILABILITY = ['Available', 'Under Offer', 'Sold', 'Rented'];

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    price: { type: Number, required: true, min: 0 },
    listingType: { type: String, enum: LISTING_TYPES, required: true },
    propertyType: { type: String, enum: PROPERTY_TYPES, required: true },
    availability: { type: String, enum: AVAILABILITY, default: 'Available' },
    location: {
      address: { type: String, trim: true, default: '' },
      locality: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      pincode: { type: String, trim: true, default: '' },
    },
    bedrooms: { type: Number, min: 0, default: 0 },
    bathrooms: { type: Number, min: 0, default: 0 },
    areaSqft: { type: Number, min: 0, default: 0 },
    furnishing: {
      type: String,
      enum: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'],
      default: 'Unfurnished',
    },
    amenities: [{ type: String, trim: true }],
    images: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

propertySchema.index({ title: 'text', description: 'text', 'location.locality': 'text', 'location.city': 'text' });
propertySchema.index({ 'location.city': 1, propertyType: 1, listingType: 1, availability: 1, price: 1 });

module.exports = mongoose.model('Property', propertySchema);
module.exports.PROPERTY_TYPES = PROPERTY_TYPES;
module.exports.LISTING_TYPES = LISTING_TYPES;
module.exports.AVAILABILITY = AVAILABILITY;
