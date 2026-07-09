const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// @route   POST api/appointments
// @desc    Submit a new appointment request
// @access  Private (Registered Users)
router.post('/', auth, async (req, res) => {
  const { patientName, phone, email, doctor, date, timeSlot } = req.body;

  if (!patientName || !phone || !email || !doctor || !date || !timeSlot) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check for double booking
    let doubleBooking = null;
    if (dbState.isMock) {
      const match = mockDb.find('appointments', { doctor, date, timeSlot });
      doubleBooking = match.find(appt => appt.status !== 'Cancelled');
    } else {
      doubleBooking = await Appointment.findOne({ 
        doctor, 
        date, 
        timeSlot, 
        status: { $ne: 'Cancelled' } 
      });
    }

    if (doubleBooking) {
      return res.status(400).json({ message: 'This time slot is already booked for this doctor. Please choose another slot.' });
    }

    let newAppointment;
    if (dbState.isMock) {
      newAppointment = mockDb.create('appointments', {
        userId: req.user.id,
        patientName,
        phone,
        email,
        doctor,
        date,
        timeSlot,
        status: 'Pending'
      });
      
      // Auto-trigger confirmation notification
      mockDb.create('notifications', {
        userId: req.user.id,
        title: 'Appointment Request Submitted',
        message: `Your appointment request with ${doctor} on ${date} at ${timeSlot} has been submitted. Status: Pending.`,
        type: 'Appointment',
        isRead: false
      });
    } else {
      newAppointment = new Appointment({
        userId: req.user.id,
        patientName,
        phone,
        email,
        doctor,
        date,
        timeSlot,
        status: 'Pending'
      });
      await newAppointment.save();

      // Auto-trigger confirmation notification
      const Notification = require('../models/Notification');
      const newNotification = new Notification({
        userId: req.user.id,
        title: 'Appointment Request Submitted',
        message: `Your appointment request with ${doctor} on ${date} at ${timeSlot} has been submitted. Status: Pending.`,
        type: 'Appointment',
        isRead: false
      });
      await newNotification.save();
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
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
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

    // Attempt to link userId if it was not set originally, by searching user by email
    let finalUserId = updatedAppt.userId;
    if (!finalUserId) {
      let foundUser;
      if (dbState.isMock) {
        foundUser = mockDb.findOne('users', { email: updatedAppt.email });
      } else {
        foundUser = await User.findOne({ email: updatedAppt.email });
      }
      if (foundUser) {
        finalUserId = foundUser._id;
        // update appointment with userId
        if (dbState.isMock) {
          mockDb.findByIdAndUpdate('appointments', updatedAppt._id, { userId: finalUserId });
        } else {
          await Appointment.findByIdAndUpdate(updatedAppt._id, { userId: finalUserId });
        }
      }
    }

    // Trigger Notification for the user
    if (finalUserId) {
      const notifData = {
        userId: finalUserId,
        title: `Appointment ${status}`,
        message: `Your appointment request with ${updatedAppt.doctor} on ${updatedAppt.date} at ${updatedAppt.timeSlot} has been ${status.toLowerCase()}.`,
        type: 'Appointment',
        isRead: false
      };

      if (dbState.isMock) {
        mockDb.create('notifications', notifData);
      } else {
        const Notification = require('../models/Notification');
        const newNotification = new Notification(notifData);
        await newNotification.save();
      }
    }

    res.json(updatedAppt);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
