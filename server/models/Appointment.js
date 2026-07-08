const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  doctor: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
