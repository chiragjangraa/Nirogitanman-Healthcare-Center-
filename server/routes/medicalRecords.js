const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/medical-records/user/:userId
// @desc    Get medical records for a specific user
// @access  Private (User or Admin)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Check permissions: only the user themselves or an admin can access
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let records;
    if (dbState.isMock) {
      records = mockDb.find('medicalRecords', { userId: req.params.userId });
    } else {
      records = await MedicalRecord.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    }
    res.json(records);
  } catch (err) {
    console.error('Fetch medical records error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/medical-records
// @desc    Get all medical records
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    let records;
    if (dbState.isMock) {
      records = mockDb.find('medicalRecords');
    } else {
      records = await MedicalRecord.find().populate('userId', 'name email phone').sort({ createdAt: -1 });
    }
    res.json(records);
  } catch (err) {
    console.error('Fetch all medical records error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/medical-records
// @desc    Create a new medical record
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const { userId, doctorName, date, diagnosis, prescription, reports, notes } = req.body;

    if (!userId || !doctorName || !date || !diagnosis || !prescription) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    let newRecord;
    if (dbState.isMock) {
      newRecord = mockDb.create('medicalRecords', {
        userId,
        doctorName,
        date,
        diagnosis,
        prescription,
        reports: reports || [],
        notes: notes || ''
      });
      
      // Auto trigger notification for user
      mockDb.create('notifications', {
        userId,
        title: 'New Medical Record Added',
        message: `Dr. ${doctorName} has added a new medical record (Diagnosis: ${diagnosis}) to your dashboard.`,
        type: 'Medical',
        isRead: false
      });
    } else {
      newRecord = new MedicalRecord({
        userId,
        doctorName,
        date,
        diagnosis,
        prescription,
        reports: reports || [],
        notes: notes || ''
      });
      await newRecord.save();

      // Auto trigger notification for user
      const Notification = require('../models/Notification');
      const newNotification = new Notification({
        userId,
        title: 'New Medical Record Added',
        message: `Dr. ${doctorName} has added a new medical record (Diagnosis: ${diagnosis}) to your dashboard.`,
        type: 'Medical',
        isRead: false
      });
      await newNotification.save();
    }

    res.status(201).json(newRecord);
  } catch (err) {
    console.error('Create medical record error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/medical-records/:id
// @desc    Update a medical record
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const { doctorName, date, diagnosis, prescription, reports, notes } = req.body;

    let updatedRecord;
    if (dbState.isMock) {
      updatedRecord = mockDb.findByIdAndUpdate('medicalRecords', req.params.id, {
        doctorName,
        date,
        diagnosis,
        prescription,
        reports,
        notes
      });
    } else {
      updatedRecord = await MedicalRecord.findByIdAndUpdate(
        req.params.id,
        { doctorName, date, diagnosis, prescription, reports, notes },
        { new: true }
      );
    }

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json(updatedRecord);
  } catch (err) {
    console.error('Update medical record error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/medical-records/:id
// @desc    Delete a medical record
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    let deletedRecord;
    if (dbState.isMock) {
      deletedRecord = mockDb.findByIdAndDelete('medicalRecords', req.params.id);
    } else {
      deletedRecord = await MedicalRecord.findByIdAndDelete(req.params.id);
    }

    if (!deletedRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json({ message: 'Medical record deleted successfully' });
  } catch (err) {
    console.error('Delete medical record error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
