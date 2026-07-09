const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

const JWT_SECRET = () => process.env.JWT_SECRET || 'nirogitanman_jwt_secret_key_2024_secure';

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    let existingUser = null;
    if (dbState.isMock) {
      existingUser = mockDb.findOne('users', { email: email.toLowerCase().trim() });
    } else {
      const User = require('../models/User');
      existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    if (dbState.isMock) {
      newUser = mockDb.create('users', {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone,
        password: hashedPassword,
        role: 'user'
      });
    } else {
      const User = require('../models/User');
      newUser = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone,
        password: hashedPassword,
        role: 'user'
      });
      await newUser.save();
    }

    const payload = { id: newUser._id, email: newUser.email, role: 'user' };
    const token = jwt.sign(payload, JWT_SECRET(), { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: 'user'
      }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter email and password' });
  }

  try {
    let user = null;
    if (dbState.isMock) {
      user = mockDb.findOne('users', { email: email.toLowerCase().trim() });
    } else {
      const User = require('../models/User');
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user._id, email: user.email, role: 'user' };
    const token = jwt.sign(payload, JWT_SECRET(), { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: 'user'
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/profile
// @desc    Get user profile + appointments
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied: Users only' });
    }

    let appointments = [];
    if (dbState.isMock) {
      const all = mockDb.find('appointments');
      appointments = all.filter(a =>
        (a.userId && a.userId === req.user.id) ||
        (a.email && a.email === req.user.email)
      ).reverse();
    } else {
      const Appointment = require('../models/Appointment');
      appointments = await Appointment.find({
        $or: [{ userId: req.user.id }, { email: req.user.email }]
      }).sort({ createdAt: -1 });
    }

    res.json({ user: req.user, appointments });
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/profile
// @desc    Update user name and phone
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: 'Please provide name and phone' });
  }
  try {
    if (dbState.isMock) {
      const updatedUser = mockDb.findByIdAndUpdate('users', req.user.id, { name: name.trim(), phone });
      if (!updatedUser) return res.status(404).json({ message: 'User not found' });
      return res.json({ id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone, role: updatedUser.role });
    } else {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.name = name.trim();
      user.phone = phone;
      await user.save();
      return res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
    }
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users
// @desc    Get all registered users (Admin only)
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    let users;
    if (dbState.isMock) {
      users = mockDb.find('users');
    } else {
      const User = require('../models/User');
      users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    }
    res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
