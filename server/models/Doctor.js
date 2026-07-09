const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  qualification: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  experienceYears: {
    type: Number,
    default: 5
  },
  availableTimings: {
    type: [String],
    default: ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"]
  },
  status: {
    type: String,
    enum: ['Available', 'Unavailable'],
    default: 'Available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
