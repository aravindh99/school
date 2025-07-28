const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
    minlength: [3, 'Institution name must be at least 3 characters'],
    maxlength: [39, 'Institution name cannot exceed 39 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    minlength: [3, 'City must be at least 3 characters'],
    maxlength: [14, 'City cannot exceed 14 characters']
  },
  type: {
    type: String,
    enum: ['school', 'college'],
    required: [true, 'Institution type is required'],
    default: 'school'
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

// Create default classes when school is approved (only for schools, not colleges)
schoolSchema.pre('save', function(next) {
  if (this.status === 'approved' && this.type === 'school' && this.classes.length === 0) {
    this.classes = ['7', '8', '9', '10', '11', '12'];
    this.approvedAt = new Date();
  } else if (this.status === 'approved' && this.type === 'college') {
    this.classes = []; // Colleges don't have classes
    this.approvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('School', schoolSchema);