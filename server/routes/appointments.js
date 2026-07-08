const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// @route   POST api/appointments
// @desc    Submit a new appointment request
// @access  Public
router.post('/', async (req, res) => {
  const { patientName, phone, email, doctor, date } = req.body;

  if (!patientName || !phone || !email || !doctor || !date) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    let newAppointment;
    if (dbState.isMock) {
      newAppointment = mockDb.create('appointments', {
        patientName,
        phone,
        email,
        doctor,
        date,
        status: 'Pending'
      });
    } else {
      newAppointment = new Appointment({
        patientName,
        phone,
        email,
        doctor,
        date,
        status: 'Pending'
      });
      await newAppointment.save();
    }
    res.status(201).json(newAppointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/appointments
// @desc    Get all appointments (Admin only)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let appointments;
    if (dbState.isMock) {
      appointments = mockDb.find('appointments');
    } else {
      appointments = await Appointment.find().sort({ createdAt: -1 });
    }
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/appointments/:id/status
// @desc    Update appointment status
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;

  if (!['Pending', 'Approved', 'Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    let updatedAppt;
    if (dbState.isMock) {
      updatedAppt = mockDb.findByIdAndUpdate('appointments', req.params.id, { status });
    } else {
      updatedAppt = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );
    }

    if (!updatedAppt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(updatedAppt);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
