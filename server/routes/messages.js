const express = require('express');
const router = express.Router();
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// @route   POST api/messages
// @desc    Submit a contact message
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please include all fields' });
  }

  try {
    let newMessage;
    if (dbState.isMock) {
      newMessage = mockDb.create('messages', { name, email, message });
    } else {
      const Message = require('../models/Message');
      newMessage = new Message({ name, email, message });
      await newMessage.save();
    }
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/messages
// @desc    Get all contact messages
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let messages;
    if (dbState.isMock) {
      messages = mockDb.find('messages');
    } else {
      const Message = require('../models/Message');
      messages = await Message.find().sort({ createdAt: -1 });
    }
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/messages/:id
// @desc    Delete a message
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let deletedMessage;
    if (dbState.isMock) {
      deletedMessage = mockDb.findByIdAndDelete('messages', req.params.id);
    } else {
      const Message = require('../models/Message');
      deletedMessage = await Message.findByIdAndDelete(req.params.id);
    }

    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
