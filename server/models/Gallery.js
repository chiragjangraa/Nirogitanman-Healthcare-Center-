const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);
