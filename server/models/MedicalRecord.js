const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  prescription: {
    type: String,
    required: true
  },
  reports: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
