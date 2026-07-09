const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/faqs
// @desc    Get all FAQs
// @access  Public
router.get('/', async (req, res) => {
  try {
    let faqs;
    if (dbState.isMock) {
      faqs = mockDb.find('faqs');
    } else {
      faqs = await FAQ.find().sort({ createdAt: -1 });
    }
    res.json(faqs);
  } catch (err) {
    console.error('Fetch FAQs error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/faqs
// @desc    Create a new FAQ
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { question, answer, category } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Please provide both question and answer' });
    }

    let newFaq;
    if (dbState.isMock) {
      newFaq = mockDb.create('faqs', { question, answer, category: category || 'General' });
    } else {
      newFaq = new FAQ({ question, answer, category: category || 'General' });
      await newFaq.save();
    }

    res.status(201).json(newFaq);
  } catch (err) {
    console.error('Create FAQ error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/faqs/:id
// @desc    Update an FAQ
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { question, answer, category } = req.body;

    let updatedFaq;
    if (dbState.isMock) {
      updatedFaq = mockDb.findByIdAndUpdate('faqs', req.params.id, { question, answer, category });
    } else {
      updatedFaq = await FAQ.findByIdAndUpdate(
        req.params.id,
        { question, answer, category },
        { new: true }
      );
    }

    if (!updatedFaq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json(updatedFaq);
  } catch (err) {
    console.error('Update FAQ error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/faqs/:id
// @desc    Delete an FAQ
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let deletedFaq;
    if (dbState.isMock) {
      deletedFaq = mockDb.findByIdAndDelete('faqs', req.params.id);
    } else {
      deletedFaq = await FAQ.findByIdAndDelete(req.params.id);
    }

    if (!deletedFaq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    console.error('Delete FAQ error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
