const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/gallery
// @desc    Get all gallery items
// @access  Public
router.get('/', async (req, res) => {
  try {
    let gallery;
    if (dbState.isMock) {
      gallery = mockDb.find('gallery');
    } else {
      gallery = await Gallery.find().sort({ createdAt: -1 });
    }
    res.json(gallery);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/gallery
// @desc    Add an image to gallery
// @access  Private
router.post('/', auth, async (req, res) => {
  const { imageUrl, title } = req.body;

  if (!imageUrl || !title) {
    return res.status(400).json({ message: 'Please include both image URL and title' });
  }

  try {
    let newItem;
    if (dbState.isMock) {
      newItem = mockDb.create('gallery', { imageUrl, title });
    } else {
      newItem = new Gallery({ imageUrl, title });
      await newItem.save();
    }
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/gallery/:id
// @desc    Delete a gallery image
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let deletedItem;
    if (dbState.isMock) {
      deletedItem = mockDb.findByIdAndDelete('gallery', req.params.id);
    } else {
      deletedItem = await Gallery.findByIdAndDelete(req.params.id);
    }

    if (!deletedItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json({ message: 'Gallery item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
