const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/blogs
// @desc    Get all blogs
// @access  Public
router.get('/', async (req, res) => {
  try {
    let blogs;
    if (dbState.isMock) {
      blogs = mockDb.find('blogs');
    } else {
      blogs = await Blog.find().sort({ date: -1 });
    }
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/blogs
// @desc    Create a new blog post
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, content, image, author } = req.body;

  if (!title || !content || !image || !author) {
    return res.status(400).json({ message: 'Please include all fields' });
  }

  try {
    let newBlog;
    if (dbState.isMock) {
      newBlog = mockDb.create('blogs', { title, content, image, author, date: new Date().toISOString() });
    } else {
      newBlog = new Blog({ title, content, image, author });
      await newBlog.save();
    }
    res.status(201).json(newBlog);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/blogs/:id
// @desc    Update a blog post
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, content, image, author } = req.body;

  try {
    let updatedBlog;
    if (dbState.isMock) {
      updatedBlog = mockDb.findByIdAndUpdate('blogs', req.params.id, { title, content, image, author });
    } else {
      updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        { title, content, image, author },
        { new: true, runValidators: true }
      );
    }

    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(updatedBlog);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/blogs/:id
// @desc    Delete a blog post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let deletedBlog;
    if (dbState.isMock) {
      deletedBlog = mockDb.findByIdAndDelete('blogs', req.params.id);
    } else {
      deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    }

    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json({ message: 'Blog removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
