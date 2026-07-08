const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/settings
// @desc    Get website settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings;
    if (dbState.isMock) {
      settings = mockDb.getSettings();
    } else {
      settings = await Settings.findOne();
      if (!settings) {
        // Create initial if none exists
        settings = new Settings({});
        await settings.save();
      }
    }
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/settings
// @desc    Update website settings
// @access  Private
router.put('/', auth, async (req, res) => {
  const { siteName, email, phone, address, workingHours, socialLinks } = req.body;

  try {
    let updatedSettings;
    if (dbState.isMock) {
      updatedSettings = mockDb.updateSettings({ siteName, email, phone, address, workingHours, socialLinks });
    } else {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings({ siteName, email, phone, address, workingHours, socialLinks });
      } else {
        settings.siteName = siteName || settings.siteName;
        settings.email = email || settings.email;
        settings.phone = phone || settings.phone;
        settings.address = address || settings.address;
        settings.workingHours = workingHours || settings.workingHours;
        if (socialLinks) {
          settings.socialLinks = { ...settings.socialLinks, ...socialLinks };
        }
      }
      updatedSettings = await settings.save();
    }
    res.json(updatedSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
