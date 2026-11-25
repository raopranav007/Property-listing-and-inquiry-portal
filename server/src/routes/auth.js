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

// GET /api/auth/me  – current logged-in user
router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
