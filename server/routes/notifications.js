const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/notifications
// @desc    Get user notifications
// @access  Private (User or Admin)
router.get('/', auth, async (req, res) => {
  try {
    let notifications;
    if (dbState.isMock) {
      notifications = mockDb.find('notifications', { userId: req.user.id });
    } else {
      notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(notifications);
  } catch (err) {
    console.error('Fetch notifications error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    let updatedNotif;
    if (dbState.isMock) {
      updatedNotif = mockDb.findByIdAndUpdate('notifications', req.params.id, { isRead: true });
    } else {
      updatedNotif = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { isRead: true },
        { new: true }
      );
    }

    if (!updatedNotif) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(updatedNotif);
  } catch (err) {
    console.error('Mark notification read error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/notifications/read-all
// @desc    Mark all user notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    if (dbState.isMock) {
      const data = mockDb.find('notifications', { userId: req.user.id });
      data.forEach(notif => {
        mockDb.findByIdAndUpdate('notifications', notif._id, { isRead: true });
      });
      res.json({ message: 'All notifications marked as read' });
    } else {
      await Notification.updateMany(
        { userId: req.user.id, isRead: false },
        { isRead: true }
      );
      res.json({ message: 'All notifications marked as read' });
    }
  } catch (err) {
    console.error('Mark all notifications read error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
