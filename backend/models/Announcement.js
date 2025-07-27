const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  content: {
    type: String,
    trim: true,
    maxlength: [200, 'Announcement cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Only allow one announcement document
announcementSchema.statics.getAnnouncement = async function() {
  let announcement = await this.findOne();
  if (!announcement) {
    announcement = await this.create({ content: '', isActive: false });
  }
  return announcement;
};

announcementSchema.statics.updateAnnouncement = async function(content) {
  let announcement = await this.findOne();
  if (!announcement) {
    announcement = new this();
  }
  
  announcement.content = content.trim();
  announcement.isActive = content.trim().length > 0;
  announcement.updatedAt = new Date();
  
  return await announcement.save();
};

module.exports = mongoose.model('Announcement', announcementSchema);