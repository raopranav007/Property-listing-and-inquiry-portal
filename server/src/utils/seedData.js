const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');

// Sample images are local SVG illustrations served from /samples (works offline).
const img = (n) => `/samples/property-${n}.svg`;

const properties = [
  {
    title: '3 BHK Apartment near Metro Station',
    description:
      'Spacious 3 BHK on the 7th floor with east-facing balcony, modular kitchen and covered parking. Walking distance to the metro, schools and a shopping mall. Society has 24x7 security, power backup, lift and a children\'s play area.',
    price: 8500000, listingType: 'Sale', propertyType: 'Apartment', availability: 'Available',
    location: { address: 'Tower B, Green Heights', locality: 'Sector 62', city: 'Noida', pincode: '201309' },
    bedrooms: 3, bathrooms: 2, areaSqft: 1450, furnishing: 'Semi-Furnished',
    amenities: ['Lift', 'Power Backup', 'Parking', 'Security', 'Gym'], images: [img(1), img(2)], featured: true,
  },
  {
    title: '2 BHK Builder Floor for Rent',
    description:
      'Well-maintained 2 BHK independent floor with separate entrance. Ideal for small families or working professionals. Close to the market and bus stand. Water supply 24 hours.',
    price: 18000, listingType: 'Rent', propertyType: 'House', availability: 'Available',
    location: { address: 'H.No. 214', locality: 'Indirapuram', city: 'Ghaziabad', pincode: '201014' },
    bedrooms: 2, bathrooms: 2, areaSqft: 950, furnishing: 'Unfurnished',
    amenities: ['Parking', 'Water Supply'], images: [img(3)], featured: true,
  },
  {
    title: 'Luxury 4 BHK Villa with Garden',
    description:
      'Independent villa in a gated community with a private garden, terrace, servant quarter and two covered parking spaces. Clubhouse with swimming pool. Premium Italian marble flooring.',
    price: 32500000, listingType: 'Sale', propertyType: 'Villa', availability: 'Under Offer',
    location: { address: 'Villa 18, Palm Grove', locality: 'Sohna Road', city: 'Gurugram', pincode: '122018' },
    bedrooms: 4, bathrooms: 5, areaSqft: 3600, furnishing: 'Fully Furnished',
    amenities: ['Swimming Pool', 'Clubhouse', 'Garden', 'Parking', 'Security', 'Power Backup'], images: [img(4), img(1)], featured: true,
  },
  {
    title: 'Residential Plot – 200 sq. yd.',
    description:
      'East-facing residential plot in an approved layout with wide roads, street lights and drainage. Registry ready. Good investment opportunity close to the upcoming expressway.',
    price: 4200000, listingType: 'Sale', propertyType: 'Plot', availability: 'Available',
    location: { address: 'Plot 77, Block C', locality: 'Greater Noida West', city: 'Noida', pincode: '201318' },
    bedrooms: 0, bathrooms: 0, areaSqft: 1800, furnishing: 'Unfurnished',
    amenities: ['Gated', 'Wide Roads'], images: [img(5)],
  },
  {
    title: 'Furnished 1 BHK Studio for Rent',
    description:
      'Compact fully furnished studio with AC, fridge, washing machine and Wi-Fi. Perfect for students and bachelors. 5 minutes from the university campus.',
    price: 12000, listingType: 'Rent', propertyType: 'Apartment', availability: 'Available',
    location: { address: 'Flat 302, Sunrise Residency', locality: 'Knowledge Park', city: 'Greater Noida', pincode: '201310' },
    bedrooms: 1, bathrooms: 1, areaSqft: 520, furnishing: 'Fully Furnished',
    amenities: ['AC', 'Wi-Fi', 'Lift', 'Power Backup'], images: [img(6)],
  },
  {
    title: 'Shop / Office Space on Main Road',
    description:
      'Ground floor commercial space on the main market road with high footfall. Suitable for retail, clinic or office. Includes washroom and shutter front.',
    price: 45000, listingType: 'Rent', propertyType: 'Commercial', availability: 'Available',
    location: { address: 'Shop 4, Raj Plaza', locality: 'Raj Nagar', city: 'Ghaziabad', pincode: '201002' },
    bedrooms: 0, bathrooms: 1, areaSqft: 600, furnishing: 'Unfurnished',
    amenities: ['Main Road', 'Parking', 'Power Backup'], images: [img(7)],
  },
  {
    title: 'Boys PG with Meals',
    description:
      'Twin-sharing PG accommodation with 3 meals a day, housekeeping, laundry and Wi-Fi. Near IT park and metro station.',
    price: 9500, listingType: 'Rent', propertyType: 'PG', availability: 'Available',
    location: { address: 'C-45', locality: 'Sector 15', city: 'Noida', pincode: '201301' },
    bedrooms: 1, bathrooms: 1, areaSqft: 200, furnishing: 'Fully Furnished',
    amenities: ['Meals', 'Wi-Fi', 'Laundry', 'Housekeeping'], images: [img(8)],
  },
  {
    title: '2 BHK Flat Ready to Move',
    description:
      'Ready-to-move 2 BHK in a RERA-approved society. Vastu-compliant, cross-ventilation, two balconies and covered parking.',
    price: 5600000, listingType: 'Sale', propertyType: 'Apartment', availability: 'Sold',
    location: { address: 'Tower 3, Shanti Enclave', locality: 'Vaishali', city: 'Ghaziabad', pincode: '201010' },
    bedrooms: 2, bathrooms: 2, areaSqft: 1100, furnishing: 'Semi-Furnished',
    amenities: ['Lift', 'Parking', 'Security'], images: [img(2)],
  },
  {
    title: 'Independent House with Terrace',
    description:
      'Double-storey independent house with 3 bedrooms, open terrace, puja room and car parking. Quiet residential colony close to the park.',
    price: 35000, listingType: 'Rent', propertyType: 'House', availability: 'Rented',
    location: { address: 'B-112', locality: 'DLF Phase 3', city: 'Gurugram', pincode: '122002' },
    bedrooms: 3, bathrooms: 3, areaSqft: 1800, furnishing: 'Semi-Furnished',
    amenities: ['Terrace', 'Parking', 'Garden'], images: [img(3), img(4)],
  },
];

async function seedDatabase({ reset = false } = {}) {
  if (reset) {
    await Promise.all([User.deleteMany({}), Property.deleteMany({}), Inquiry.deleteMany({})]);
  }

  const email = (process.env.ADMIN_EMAIL || 'admin@propertyportal.com').toLowerCase();
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      name: process.env.ADMIN_NAME || 'Agency Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
    });
  }

  if ((await Property.countDocuments()) > 0) return { admin, created: 0 };

  const created = await Property.insertMany(properties.map((p) => ({ ...p, createdBy: admin._id })));

  await Inquiry.insertMany([
    {
      property: created[0]._id, name: 'Rohit Sharma', email: 'rohit@example.com', phone: '9876543210',
      message: 'Is the price negotiable? I would like to visit this weekend.', preferredContact: 'Phone', status: 'New',
    },
    {
      property: created[1]._id, name: 'Ananya Verma', email: 'ananya@example.com', phone: '9811122233',
      message: 'Is the floor available from next month? Are pets allowed?', preferredContact: 'WhatsApp', status: 'Contacted',
      notes: [{ text: 'Called – owner allows small pets. Sharing photos on WhatsApp.', author: 'Agency Admin' }],
    },
    {
      property: created[2]._id, name: 'Vikram Singh', email: 'vikram@example.com', phone: '9990011122',
      message: 'Interested in the villa. Please share the brochure and payment plan.', preferredContact: 'Email', status: 'Site Visit Scheduled',
      notes: [{ text: 'Site visit fixed for Saturday 11 AM.', author: 'Agency Admin' }],
    },
  ]);

  return { admin, created: created.length };
}

module.exports = { seedDatabase };
