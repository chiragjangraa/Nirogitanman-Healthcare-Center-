const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
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
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    let admin = null;
    if (dbState.isMock) {
      admin = mockDb.findOne('admins', { email });
    } else {
      admin = await Admin.findOne({ email });
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
      role: admin.role
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
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/me
// @desc    Get current admin user
// @access  Private
router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
