const express = require('express');
const router = express.Router();
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// IMPORTANT: /read-all MUST be declared BEFORE /:id/read
// Otherwise Express matches 'read-all' as an :id param

// @route   PUT api/notifications/read-all
// @desc    Mark all user notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    if (dbState.isMock) {
      const allNotifs = mockDb.find('notifications');
      const userNotifs = allNotifs.filter(n => n.userId === req.user.id || n.userId === String(req.user.id));
      userNotifs.forEach(notif => {
        mockDb.findByIdAndUpdate('notifications', notif._id, { isRead: true });
      });
      res.json({ message: 'All notifications marked as read', count: userNotifs.length });
    } else {
      const Notification = require('../models/Notification');
      const result = await Notification.updateMany(
        { userId: req.user.id, isRead: false },
        { isRead: true }
      );
      res.json({ message: 'All notifications marked as read', count: result.modifiedCount });
    }
  } catch (err) {
    console.error('Mark all notifications read error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/notifications
// @desc    Get user notifications (sorted newest first)
// @access  Private (User or Admin)
router.get('/', auth, async (req, res) => {
  try {
    let notifications;
    if (dbState.isMock) {
      const allNotifs = mockDb.find('notifications');
      // Filter by userId — handle both string and ObjectId comparisons
      notifications = allNotifs
        .filter(n => n.userId === req.user.id || n.userId === String(req.user.id))
        .reverse(); // newest first
    } else {
      const Notification = require('../models/Notification');
      notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(notifications);
  } catch (err) {
    console.error('Fetch notifications error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark a single notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    let updatedNotif;
    if (dbState.isMock) {
      updatedNotif = mockDb.findByIdAndUpdate('notifications', req.params.id, { isRead: true });
    } else {
      const Notification = require('../models/Notification');
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

// @route   POST api/notifications
// @desc    Create a notification (Admin only — manual notify)
// @access  Private/Admin
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    const { userId, title, message, type } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'userId, title, and message are required' });
    }

    let newNotif;
    if (dbState.isMock) {
      newNotif = mockDb.create('notifications', { userId, title, message, type: type || 'Info', isRead: false });
    } else {
      const Notification = require('../models/Notification');
      newNotif = new Notification({ userId, title, message, type: type || 'Info', isRead: false });
      await newNotif.save();
    }
    res.status(201).json(newNotif);
  } catch (err) {
    console.error('Create notification error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/notifications/admin/all
// @desc    Get all notifications (admin view)
// @access  Private/Admin
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    let notifications;
    if (dbState.isMock) {
      notifications = mockDb.find('notifications').reverse();
    } else {
      const Notification = require('../models/Notification');
      notifications = await Notification.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    }
    res.json(notifications);
  } catch (err) {
    console.error('Fetch all notifications error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
