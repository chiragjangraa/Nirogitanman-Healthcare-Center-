const express = require('express');
const router = express.Router();
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/doctors
// @desc    Get all doctors
// @access  Public
router.get('/', async (req, res) => {
  try {
    let doctors;
    if (dbState.isMock) {
      doctors = mockDb.find('doctors');
    } else {
      const Doctor = require('../models/Doctor');
      doctors = await Doctor.find().sort({ createdAt: -1 });
    }
    res.json(doctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/doctors/:id
// @desc    Get doctor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    let doctor;
    if (dbState.isMock) {
      doctor = mockDb.findById('doctors', req.params.id);
    } else {
      const Doctor = require('../models/Doctor');
      doctor = await Doctor.findById(req.params.id);
    }

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/doctors
// @desc    Add a new doctor
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  const { name, specialization, qualification, image, description, experienceYears, availableTimings, status } = req.body;

  if (!name || !specialization || !qualification || !image || !description) {
    return res.status(400).json({ message: 'Please include all required fields' });
  }

  try {
    let newDoc;
    if (dbState.isMock) {
      newDoc = mockDb.create('doctors', { 
        name, 
        specialization, 
        qualification, 
        image, 
        description,
        experienceYears: Number(experienceYears) || 5,
        availableTimings: availableTimings || ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"],
        status: status || 'Available'
      });
    } else {
      const Doctor = require('../models/Doctor');
      newDoc = new Doctor({ 
        name, 
        specialization, 
        qualification, 
        image, 
        description,
        experienceYears: Number(experienceYears) || 5,
        availableTimings: availableTimings || ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"],
        status: status || 'Available'
      });
      await newDoc.save();
    }
    res.status(201).json(newDoc);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/doctors/:id
// @desc    Update doctor details
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  const { name, specialization, qualification, image, description, experienceYears, availableTimings, status } = req.body;

  try {
    let updatedDoc;
    if (dbState.isMock) {
      updatedDoc = mockDb.findByIdAndUpdate('doctors', req.params.id, { 
        name, 
        specialization, 
        qualification, 
        image, 
        description,
        experienceYears: Number(experienceYears),
        availableTimings,
        status
      });
    } else {
      const Doctor = require('../models/Doctor');
      updatedDoc = await Doctor.findByIdAndUpdate(
        req.params.id,
        { name, specialization, qualification, image, description, experienceYears: Number(experienceYears), availableTimings, status },
        { new: true, runValidators: true }
      );
    }

    if (!updatedDoc) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(updatedDoc);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/doctors/:id
// @desc    Delete a doctor
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    let deletedDoc;
    if (dbState.isMock) {
      deletedDoc = mockDb.findByIdAndDelete('doctors', req.params.id);
    } else {
      const Doctor = require('../models/Doctor');
      deletedDoc = await Doctor.findByIdAndDelete(req.params.id);
    }

    if (!deletedDoc) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
