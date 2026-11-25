const mongoose = require('mongoose');

const INQUIRY_STATUS = ['New', 'Contacted', 'Site Visit Scheduled', 'Closed'];

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    author: { type: String, default: 'Admin' },
  },
  { timestamps: true }
);

const inquirySchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 1500 },
    preferredContact: { type: String, enum: ['Phone', 'Email', 'WhatsApp'], default: 'Phone' },
    status: { type: String, enum: INQUIRY_STATUS, default: 'New' },
    notes: [noteSchema],
  },
  { timestamps: true }
);

inquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
module.exports.INQUIRY_STATUS = INQUIRY_STATUS;
