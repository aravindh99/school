const mongoose = require('mongoose');

const rumorSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School ID is required']
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    enum: ['7', '8', '9', '10', '11', '12']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [10000, 'Content cannot exceed 10000 characters'],
    minlength: [10, 'Content must be at least 10 characters long']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
rumorSchema.index({ schoolId: 1, createdAt: -1 });
rumorSchema.index({ schoolId: 1, class: 1, createdAt: -1 });

module.exports = mongoose.model('Rumor', rumorSchema);