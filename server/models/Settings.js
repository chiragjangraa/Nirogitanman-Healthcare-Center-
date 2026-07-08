const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: "Nirogitanman Healthcare"
  },
  email: {
    type: String,
    default: "contact@nirogitanman.com"
  },
  phone: {
    type: String,
    default: "+91 98765 43210"
  },
  address: {
    type: String,
    default: "123, Wellness Enclave, Health City, Sector 5, New Delhi - 110001"
  },
  workingHours: {
    type: String,
    default: "Mon - Sat: 8:00 AM - 8:00 PM, Sun: Emergency Only"
  },
  socialLinks: {
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
