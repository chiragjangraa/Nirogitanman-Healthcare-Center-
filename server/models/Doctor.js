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
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
