const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/login  – broker/admin login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
      if (!user || !(await user.comparePassword(req.body.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      res.json({ token: signToken(user), user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/setup  – true while no broker/admin account exists yet
router.get('/setup', async (req, res, next) => {
  try {
    res.json({ needsSetup: (await User.countDocuments()) === 0 });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/setup  – one-time creation of the first admin account (then disabled)
router.post(
  '/setup',
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Please enter your name'),
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      if ((await User.countDocuments()) > 0) {
        return res.status(403).json({ message: 'An admin account already exists. Please log in.' });
      }
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: 'admin',
      });
      // Guard against two setups racing: keep only the earliest account
      const first = await User.findOne().sort({ createdAt: 1, _id: 1 });
      if (!first._id.equals(user._id)) {
        await user.deleteOne();
        return res.status(403).json({ message: 'An admin account already exists. Please log in.' });
      }
      res.status(201).json({ token: signToken(user), user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me  – current logged-in user
router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
