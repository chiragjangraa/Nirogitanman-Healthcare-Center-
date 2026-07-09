const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    let existingUser = null;
    if (dbState.isMock) {
      existingUser = mockDb.findOne('users', { email });
    } else {
      existingUser = await User.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    if (dbState.isMock) {
      newUser = mockDb.create('users', {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'user'
      });
    } else {
      newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'user'
      });
      await newUser.save();
    }

    const payload = {
      id: newUser._id,
      email: newUser.email,
      role: 'user'
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'nirogitanman_secret_key_123_abc_xyz',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
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
      }
    );
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
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    let user = null;
    if (dbState.isMock) {
      user = mockDb.findOne('users', { email });
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user._id,
      email: user.email,
      role: 'user'
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'nirogitanman_secret_key_123_abc_xyz',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
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
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/profile
// @desc    Get user profile details
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    // Check if the current token belongs to a regular user
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied: Users only' });
    }
    
    // Check user appointments
    let appointments = [];
    if (dbState.isMock) {
      appointments = mockDb.find('appointments', { email: req.user.email });
    } else {
      const Appointment = require('../models/Appointment');
      appointments = await Appointment.find({ email: req.user.email }).sort({ createdAt: -1 });
    }

    res.json({
      user: req.user,
      appointments
    });
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile details (name and phone)
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: 'Please provide name and phone' });
  }
  try {
    if (dbState.isMock) {
      const updatedUser = mockDb.findByIdAndUpdate('users', req.user.id, { name, phone });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role
      });
    } else {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.name = name;
      user.phone = phone;
      await user.save();
      return res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      });
    }
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
