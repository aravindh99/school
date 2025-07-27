const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
    minlength: [7, 'School name must be at least 7 characters'],
    maxlength: [39, 'School name cannot exceed 39 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    minlength: [3, 'City must be at least 3 characters'],
    maxlength: [14, 'City cannot exceed 14 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  classes: [{
    type: String,
    enum: ['7', '8', '9', '10', '11', '12']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  }
});

// Create default classes when school is approved
schoolSchema.pre('save', function(next) {
  if (this.status === 'approved' && this.classes.length === 0) {
    this.classes = ['7', '8', '9', '10', '11', '12'];
    this.approvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('School', schoolSchema);