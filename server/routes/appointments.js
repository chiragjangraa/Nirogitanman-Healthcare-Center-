const express = require('express');
const router = express.Router();
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// Optional auth middleware — attaches user if token present, but doesn't block
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const jwt = require('jsonwebtoken');
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nirogitanman_jwt_secret_key_2024_secure');
      req.userId = decoded.id;
      req.userRole = decoded.role || 'user';
    }
  } catch (e) {
    // Token invalid or missing — ok for public booking
  }
  next();
};

// @route   POST api/appointments
// @desc    Submit a new appointment request (public or logged-in user)
// @access  Public (works without login too, but links userId if logged in)
router.post('/', optionalAuth, async (req, res) => {
  const { patientName, phone, email, doctor, date, timeSlot } = req.body;

  if (!patientName || !phone || !email || !doctor || !date || !timeSlot) {
    return res.status(400).json({ message: 'Please fill in all required fields including a time slot.' });
  }

  try {
    // Check for double booking
    if (dbState.isMock) {
      const existingSlots = mockDb.find('appointments', { doctor, date, timeSlot });
      const doubleBooking = existingSlots.find(a => a.status !== 'Cancelled');
      if (doubleBooking) {
        return res.status(400).json({ message: `This time slot (${timeSlot}) is already booked for ${doctor} on ${date}. Please choose a different slot.` });
      }

      const newAppointment = mockDb.create('appointments', {
        userId: req.userId || null,
        patientName,
        phone,
        email,
        doctor,
        date,
        timeSlot,
        status: 'Pending'
      });

      // Auto-notify if userId present
      if (req.userId) {
        mockDb.create('notifications', {
          userId: req.userId,
          title: 'Appointment Request Submitted',
          message: `Your appointment with ${doctor} on ${date} at ${timeSlot} has been received. Status: Pending.`,
          type: 'Appointment',
          isRead: false
        });
      }

      return res.status(201).json(newAppointment);
    } else {
      const Appointment = require('../models/Appointment');
      const doubleBooking = await Appointment.findOne({ doctor, date, timeSlot, status: { $ne: 'Cancelled' } });
      if (doubleBooking) {
        return res.status(400).json({ message: `This time slot (${timeSlot}) is already booked for ${doctor} on ${date}. Please choose a different slot.` });
      }

      const newAppointment = new Appointment({
        userId: req.userId || null,
        patientName, phone, email, doctor, date, timeSlot, status: 'Pending'
      });
      await newAppointment.save();

      if (req.userId) {
        const Notification = require('../models/Notification');
        await new Notification({
          userId: req.userId,
          title: 'Appointment Request Submitted',
          message: `Your appointment with ${doctor} on ${date} at ${timeSlot} has been received. Status: Pending.`,
          type: 'Appointment',
          isRead: false
        }).save();
      }

      return res.status(201).json(newAppointment);
    }
  } catch (err) {
    console.error('Appointment create error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/appointments
// @desc    Get all appointments (Admin only)
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    let appointments;
    if (dbState.isMock) {
      appointments = mockDb.find('appointments');
      // Return in reverse chronological order
      appointments = appointments.reverse();
    } else {
      const Appointment = require('../models/Appointment');
      appointments = await Appointment.find().sort({ createdAt: -1 });
    }
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/appointments/my
// @desc    Get appointments for the logged-in user
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    let appointments;
    if (dbState.isMock) {
      // Match by userId OR by email
      const all = mockDb.find('appointments');
      appointments = all.filter(a =>
        (a.userId && a.userId === req.user.id) ||
        (a.email && a.email === req.user.email)
      ).reverse();
    } else {
      const Appointment = require('../models/Appointment');
      appointments = await Appointment.find({
        $or: [{ userId: req.user.id }, { email: req.user.email }]
      }).sort({ createdAt: -1 });
    }
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/appointments/:id/status
// @desc    Update appointment status
// @access  Private/Admin
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
      const Appointment = require('../models/Appointment');
      updatedAppt = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    }

    if (!updatedAppt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Fire notification for user when status changes
    const notifyStatuses = ['Approved', 'Cancelled', 'Completed'];
    if (notifyStatuses.includes(status)) {
      let finalUserId = updatedAppt.userId;

      // Try to find userId by email if not set
      if (!finalUserId && updatedAppt.email) {
        if (dbState.isMock) {
          const foundUser = mockDb.findOne('users', { email: updatedAppt.email });
          if (foundUser) finalUserId = foundUser._id;
        } else {
          const User = require('../models/User');
          const foundUser = await User.findOne({ email: updatedAppt.email });
          if (foundUser) finalUserId = foundUser._id;
        }
      }

      if (finalUserId) {
        const notifMsg = {
          userId: finalUserId,
          title: `Appointment ${status}`,
          message: `Your appointment with ${updatedAppt.doctor} on ${updatedAppt.date}${updatedAppt.timeSlot ? ' at ' + updatedAppt.timeSlot : ''} has been ${status.toLowerCase()}.`,
          type: 'Appointment',
          isRead: false
        };
        if (dbState.isMock) {
          mockDb.create('notifications', notifMsg);
        } else {
          const Notification = require('../models/Notification');
          await new Notification(notifMsg).save();
        }
      }
    }

    res.json(updatedAppt);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
