const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/services
// @desc    Get all services
// @access  Public
router.get('/', async (req, res) => {
  try {
    let services;
    if (dbState.isMock) {
      services = mockDb.find('services');
    } else {
      services = await Service.find().sort({ createdAt: -1 });
    }
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/services
// @desc    Add a new service
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, image } = req.body;

  if (!title || !description || !image) {
    return res.status(400).json({ message: 'Please include all fields' });
  }

  try {
    let newService;
    if (dbState.isMock) {
      newService = mockDb.create('services', { title, description, image });
    } else {
      newService = new Service({ title, description, image });
      await newService.save();
    }
    res.status(201).json(newService);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/services/:id
// @desc    Update a service
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, description, image } = req.body;

  try {
    let updatedService;
    if (dbState.isMock) {
      updatedService = mockDb.findByIdAndUpdate('services', req.params.id, { title, description, image });
    } else {
      updatedService = await Service.findByIdAndUpdate(
        req.params.id,
        { title, description, image },
        { new: true, runValidators: true }
      );
    }

    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(updatedService);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/services/:id
// @desc    Delete a service
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let deletedService;
    if (dbState.isMock) {
      deletedService = mockDb.findByIdAndDelete('services', req.params.id);
    } else {
      deletedService = await Service.findByIdAndDelete(req.params.id);
    }

    if (!deletedService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
