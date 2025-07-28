const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  rumorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rumor',
    required: [true, 'Rumor ID is required']
  },
  userFingerprint: {
    type: String,
    required: [true, 'User fingerprint is required']
  },
  voteType: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: [true, 'Vote type is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one vote per user per rumor
voteSchema.index({ rumorId: 1, userFingerprint: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);