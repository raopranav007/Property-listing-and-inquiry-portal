# Property Listing & Inquiry Portal for a Local Broker/Agency

A centralised web platform where a local broker or agency manages property listings and customer inquiries, and buyers and tenants search properties and send inquiries online.

**Problem type:** Community SDG · **SDGs:** 11 (Sustainable Cities & Communities), 9 (Industry, Innovation & Infrastructure), 8 (Decent Work & Economic Growth)

| Roll No. | Name |
|---|---|
| 2501010102 | Pranav Yadav |
| 2501010103 | Kush Gautam |
| 2501010013 | Udit Srivastava |
| 2501010092 | Pratik Kumar |
| 2501010149 | Sahil Singh |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | **React.js** (Vite), **HTML**, **CSS** (hand-written, responsive), **JavaScript**, React Router, Axios |
| Backend | **Node.js**, **Express.js** REST APIs, JWT authentication, bcrypt password hashing, Multer image uploads (stored in MongoDB), express-validator |
| Database | **MongoDB** with Mongoose (collections: `properties`, `inquiries`, `users`) |
| Version control | Git and GitHub |

## Architecture

```
Customer (buyer/tenant) ──► Customer Portal ─┐
                                              ├─► React.js frontend ──► Node.js + Express.js REST APIs ──► MongoDB
Broker / Admin ──────────► Admin Dashboard ──┘         (Property APIs · Inquiry APIs · Admin auth)     (Properties · Inquiries · Admin users)
```

**Flow:** 1. Customer searches and filters listings → 2. submits an inquiry → 3. data saved in MongoDB → 4. broker views and responds from the admin dashboard.

## Features (mapped to the project objectives)

| # | Objective | Where it is implemented |
|---|---|---|
| 1 | Centralised platform for managing property listings | `properties` collection + Admin → Listings |
| 2 | Search & filter by location, price, type and availability | `/properties` page (keyword, city, locality, buy/rent, type, min/max price, bedrooms, availability, sorting, pagination; filters are kept in the URL so searches can be shared) |
| 3 | Detailed property info: images, price, location, description | `/properties/:id` – photo gallery, price (₹ L / Cr), full address, overview, description, amenities, similar listings |
| 4 | Customers submit inquiries | Inquiry form on every available listing (validated on client and server) |
| 5 | Admin panel to add, update and remove listings | Admin → Add listing / Edit / Delete, image upload or image URL, quick availability change |
| 6 | Manage and track customer inquiries | Admin → Inquiries – status pipeline (New → Contacted → Site Visit Scheduled → Closed), follow-up notes, search, filter by status |
| 7 | Less manual work, better communication | Dashboard counters, one-click Call / WhatsApp / Email reply buttons |

Also: secure login (JWT + bcrypt), protected admin routes, responsive design for mobile, and sample data so the app is usable immediately.

---

## Getting started

### Prerequisites
- **Node.js 18+** (tested on Node 24)
- **MongoDB** – either a local install, a free MongoDB Atlas cluster, or nothing at all (see below)

### 1. Install
```bash
npm run install:all
```

### 2. Configure (optional)
```bash
cp server/.env.example server/.env
```
Edit `server/.env` and set `MONGODB_URI` and `JWT_SECRET`.

> **No MongoDB installed?** Leave `MONGODB_URI` empty (or skip creating `.env`). The server then starts an **in-memory MongoDB** automatically, with sample data. That data is lost when the server stops, so use a real MongoDB for anything you want to keep.

### 3. Run in development
```bash
npm run dev
```
- Frontend: http://localhost:5173
- API: http://localhost:5000/api

In development the admin account is created automatically on first start:

| Email | Password |
|---|---|
| `admin@propertyportal.com` | `admin123` |

Change these with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env` **before** the first start.

### 4. Reset sample data (real MongoDB only)
```bash
npm run seed
```

### 5. Production build
```bash
npm run build
```
```bash
NODE_ENV=production npm start
```
Express serves the built React app from `client/dist` together with the API on one port. `MONGODB_URI` and `JWT_SECRET` are required in production.

---

## Deploying to Vercel

The repo is ready for Vercel: `vercel.json` builds the React app into static files and runs the Express API as a serverless function (`api/index.js`). Uploaded photos are stored in MongoDB, because Vercel has no permanent disk.

1. **Create a free MongoDB Atlas database** at https://www.mongodb.com/cloud/atlas. Create a database user, and under *Network Access* allow `0.0.0.0/0` (Vercel has no fixed IP). Copy the connection string, for example `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/property_portal`.
2. **Import the GitHub repo** at https://vercel.com/new. Keep the root directory as `/`; the build settings come from `vercel.json`.
3. **Environment variables** in *Project → Settings → Environment Variables*:

   | Name | Required | Value |
   |---|---|---|
   | `MONGODB_URI` | yes | your Atlas connection string (set automatically if you add MongoDB Atlas from the project's *Storage* tab) |
   | `JWT_SECRET` | no | a long random string; if omitted, one is derived from `MONGODB_URI` |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | no | creates the broker login on first start; if omitted, see step 5 |

4. **Deploy.** On the first request the API creates the sample listings in the empty database. Every push to `main` redeploys automatically.
5. **Create the broker account.** If `ADMIN_PASSWORD` was not set, open `/admin/login` on the live site right after the first deploy: it shows a one-time *Create the broker account* form. Once an account exists the form is gone for good, so do this straight away.

Or deploy from the terminal with the CLI: `npx vercel login`, then `npx vercel --prod`.

---

## Project structure

```
property-portal/
├── package.json              # root scripts (runs client + server together)
├── vercel.json               # Vercel build + routing config
├── api/index.js              # Vercel serverless entry (wraps the Express app)
├── server/                   # Node.js + Express.js + MongoDB
│   ├── .env.example
│   └── src/
│       ├── index.js          # starts the local server
│       ├── bootstrap.js      # connects DB + creates admin/sample data (shared with Vercel)
│       ├── app.js            # Express app, routes, error handling
│       ├── seed.js           # npm run seed
│       ├── config/db.js      # MongoDB connection (real or in-memory)
│       ├── models/           # Property, Inquiry, User, Image (Mongoose schemas)
│       ├── routes/           # auth.js, properties.js, inquiries.js, images.js
│       ├── middleware/       # auth (JWT), upload (Multer), validate
│       └── utils/seedData.js # sample listings, inquiries and admin user
└── client/                   # React.js (Vite)
    ├── index.html
    ├── public/samples/       # bundled sample property images
    └── src/
        ├── main.jsx, App.jsx # router setup
        ├── api.js            # Axios instance (adds JWT)
        ├── index.css         # all styles
        ├── context/AuthContext.jsx
        ├── components/       # Navbar, Footer, PropertyCard, Filters, InquiryForm, …
        └── pages/
            ├── Home.jsx, Listings.jsx, PropertyDetails.jsx, NotFound.jsx
            └── admin/        # AdminLogin, Dashboard, ManageListings, PropertyForm, Inquiries
```

## Database schema

**Property** – `title`, `description`, `price`, `listingType` (Sale/Rent), `propertyType` (Apartment/House/Villa/Plot/Commercial/PG), `availability` (Available/Under Offer/Sold/Rented), `location {address, locality, city, pincode}`, `bedrooms`, `bathrooms`, `areaSqft`, `furnishing`, `amenities[]`, `images[]`, `featured`, `createdBy → User`, timestamps

**Inquiry** – `property → Property`, `name`, `email`, `phone`, `message`, `preferredContact` (Phone/Email/WhatsApp), `status` (New/Contacted/Site Visit Scheduled/Closed), `notes[] {text, author, createdAt}`, timestamps

**Image** – `data` (binary), `contentType`, `size`, `uploadedBy → User`, timestamps

**User** – `name`, `email` (unique), `password` (bcrypt hash), `role` (admin/broker), timestamps

## REST API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Log in, returns JWT |
| GET | `/api/auth/me` | Admin | Current user |
| DELETE | `/api/auth/me` | Admin | Delete your own account (if it was the last one, first-run setup reopens) |
| GET / POST | `/api/auth/setup` | Public | Check / create the first admin account (only while none exists) |
| GET | `/api/properties` | Public | Search/filter: `q, city, locality, listingType, propertyType, availability, minPrice, maxPrice, bedrooms, featured, sort, page, limit` |
| GET | `/api/properties/meta` | Public | Cities, types and price range for filters |
| GET | `/api/properties/:id` | Public | Property details + similar listings |
| POST | `/api/images` | Admin | Upload one photo (multipart field `image`, max 4 MB), returns its URL |
| GET | `/api/images/:id` | Public | Serve an uploaded photo |
| POST | `/api/properties` | Admin | Add listing (JSON; `images` is a list of URLs) |
| PUT | `/api/properties/:id` | Admin | Update listing |
| PATCH | `/api/properties/:id/availability` | Admin | Change availability |
| DELETE | `/api/properties/:id` | Admin | Remove listing, its inquiries and its uploaded photos |
| POST | `/api/inquiries` | Public | Submit an inquiry |
| GET | `/api/inquiries` | Admin | List inquiries (`status`, `property`, `q`) |
| GET | `/api/inquiries/stats` | Admin | Dashboard counts |
| PATCH | `/api/inquiries/:id` | Admin | Update `status` and/or add a `note` |
| DELETE | `/api/inquiries/:id` | Admin | Delete an inquiry |

Admin requests need the header `Authorization: Bearer <token>`.

## Methodology

Analysis (broker and customer needs) → Design (wireframes, database schema) → Development (React UI, Express APIs) → Testing (functional and usability checks) → Deployment (host and hand over).

## Future scope

Online payments, a mobile app, and email/SMS notifications for new inquiries.

## Repository

GitHub: `raopranav007/Property-listing-and-inquiry-portal`
