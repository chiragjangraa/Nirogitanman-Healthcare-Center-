const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// @route   POST api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    let admin = null;
    if (dbState.isMock) {
      admin = mockDb.findOne('admins', { email: email.toLowerCase().trim() });
    } else {
      const Admin = require('../models/Admin');
      admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    }

    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: admin._id,
      email: admin.email,
      role: admin.role || 'admin'
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'nirogitanman_jwt_secret_key_2024_secure',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role || 'admin'
      }
    });
  } catch (err) {
    console.error('Admin login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/me
// @desc    Get current admin or user session info
// @access  Private
router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
