const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [500, 'Content cannot exceed 500 characters'],
    minlength: [10, 'Content must be at least 10 characters long']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
suggestionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Suggestion', suggestionSchema);