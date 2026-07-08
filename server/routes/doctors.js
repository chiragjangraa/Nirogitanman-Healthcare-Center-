const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
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
      doctors = await Doctor.find().sort({ createdAt: -1 });
    }
    res.json(doctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/doctors
// @desc    Add a new doctor
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, specialization, qualification, image, description } = req.body;

  if (!name || !specialization || !qualification || !image || !description) {
    return res.status(400).json({ message: 'Please include all fields' });
  }

  try {
    let newDoc;
    if (dbState.isMock) {
      newDoc = mockDb.create('doctors', { name, specialization, qualification, image, description });
    } else {
      newDoc = new Doctor({ name, specialization, qualification, image, description });
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
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, specialization, qualification, image, description } = req.body;

  try {
    let updatedDoc;
    if (dbState.isMock) {
      updatedDoc = mockDb.findByIdAndUpdate('doctors', req.params.id, { name, specialization, qualification, image, description });
    } else {
      updatedDoc = await Doctor.findByIdAndUpdate(
        req.params.id,
        { name, specialization, qualification, image, description },
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
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let deletedDoc;
    if (dbState.isMock) {
      deletedDoc = mockDb.findByIdAndDelete('doctors', req.params.id);
    } else {
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
