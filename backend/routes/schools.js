const express = require('express');
const router = express.Router();
const School = require('../models/School');
const Rumor = require('../models/Rumor');
const Vote = require('../models/Vote');
const { validateSchool, validateRumor } = require('../middleware/validation');

// Get all approved institutions (schools or colleges)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query; // 'school' or 'college'
    const filter = { status: 'approved' };
    
    if (type && ['school', 'college'].includes(type)) {
      filter.type = type;
    }
    
    const institutions = await School.find(filter)
      .select('name city type classes createdAt')
      .sort({ createdAt: -1 });
    
    // Add rumor count for each institution
    const institutionsWithCounts = await Promise.all(
      institutions.map(async (institution) => {
        const rumorCount = await Rumor.countDocuments({ schoolId: institution._id });
        return {
          ...institution.toObject(),
          rumorCount
        };
      })
    );
    
    res.json({
      success: true,
      data: institutionsWithCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching institutions',
      error: error.message
    });
  }
});

// Create new institution request (school or college)
router.post('/', validateSchool, async (req, res) => {
  try {
    const { name, city, type = 'school' } = req.body;
    
    // Validate type
    if (!['school', 'college'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either school or college'
      });
    }
    
    // Check if institution already exists
    const existingInstitution = await School.findOne({ 
      name: { $regex: new RegExp(name, 'i') },
      city: { $regex: new RegExp(city, 'i') },
      type: type
    });
    
    if (existingInstitution) {
      return res.status(400).json({
        success: false,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} already exists or is pending approval`
      });
    }
    
    const institution = new School({ name, city, type });
    await institution.save();
    
    res.status(201).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} request submitted for approval`,
      data: institution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating institution request',
      error: error.message
    });
  }
});

// Get rumors for a specific school
router.get('/:schoolId/rumors', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { class: classFilter } = req.query;
    
    // Build query
    let query = { schoolId };
    if (classFilter && classFilter !== 'all') {
      query.class = classFilter;
    }
    
    const rumors = await Rumor.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: rumors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rumors',
      error: error.message
    });
  }
});

// Create new rumor
router.post('/:schoolId/rumors', validateRumor, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { class: rumorClass, content } = req.body;
    
    // Verify institution exists and is approved
    const institution = await School.findOne({ _id: schoolId, status: 'approved' });
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found or not approved'
      });
    }
    
    // For schools, class is required. For colleges, class should be null/undefined
    const rumorData = {
      schoolId,
      content
    };
    
    if (institution.type === 'school') {
      if (!rumorClass) {
        return res.status(400).json({
          success: false,
          message: 'Class is required for school rumors'
        });
      }
      rumorData.class = rumorClass;
    }
    // For colleges, we don't set the class field
    
    const rumor = new Rumor(rumorData);
    await rumor.save();
    
    res.status(201).json({
      success: true,
      message: 'Thread posted successfully',
      data: rumor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error posting thread',
      error: error.message
    });
  }
});

// Get available classes for a school
router.get('/:schoolId/classes', async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const school = await School.findOne({ _id: schoolId, status: 'approved' })
      .select('classes');
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    
    res.json({
      success: true,
      data: school.classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching classes',
      error: error.message
    });
  }
});

// Create suggestion
router.post('/suggestions', async (req, res) => {
  try {
    const { content } = req.body;
    const Suggestion = require('../models/Suggestion');
    
    if (!content || content.trim().length < 10 || content.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Content must be between 10 and 500 characters'
      });
    }
    
    const suggestion = new Suggestion({
      content: content.trim()
    });
    
    await suggestion.save();
    
    res.status(201).json({
      success: true,
      message: 'Suggestion submitted successfully',
      data: suggestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting suggestion',
      error: error.message
    });
  }
});

// Get active announcement
router.get('/announcement', async (req, res) => {
  try {
    const Announcement = require('../models/Announcement');
    const announcement = await Announcement.getAnnouncement();
    
    // Only return if active and has content
    if (announcement.isActive && announcement.content) {
      res.json({
        success: true,
        data: announcement
      });
    } else {
      res.json({
        success: true,
        data: null
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching announcement',
      error: error.message
    });
  }
});

// Get individual school (must be last to avoid conflicts)
router.get('/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const school = await School.findOne({ _id: schoolId, status: 'approved' })
      .select('name city classes createdAt');
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    
    res.json({
      success: true,
      data: school
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching school',
      error: error.message
    });
  }
});

// Vote on a rumor
router.post('/rumors/:rumorId/vote', async (req, res) => {
  try {
    const { rumorId } = req.params;
    const { voteType, userFingerprint } = req.body;
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type'
      });
    }
    
    if (!userFingerprint) {
      return res.status(400).json({
        success: false,
        message: 'User fingerprint is required'
      });
    }
    
    // Check if rumor exists
    const rumor = await Rumor.findById(rumorId);
    if (!rumor) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }
    
    // Check if user has already voted
    const existingVote = await Vote.findOne({ rumorId, userFingerprint });
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if same type
        await Vote.deleteOne({ _id: existingVote._id });
        
        // Update rumor vote count
        if (voteType === 'upvote') {
          rumor.upvotes = Math.max(0, rumor.upvotes - 1);
        } else {
          rumor.downvotes = Math.max(0, rumor.downvotes - 1);
        }
        
        await rumor.save();
        
        return res.json({
          success: true,
          message: 'Vote removed',
          data: {
            upvotes: rumor.upvotes,
            downvotes: rumor.downvotes,
            userVote: null
          }
        });
      } else {
        // Change vote type
        const oldVoteType = existingVote.voteType;
        existingVote.voteType = voteType;
        await existingVote.save();
        
        // Update rumor vote counts
        if (oldVoteType === 'upvote') {
          rumor.upvotes = Math.max(0, rumor.upvotes - 1);
          rumor.downvotes += 1;
        } else {
          rumor.downvotes = Math.max(0, rumor.downvotes - 1);
          rumor.upvotes += 1;
        }
        
        await rumor.save();
        
        return res.json({
          success: true,
          message: 'Vote updated',
          data: {
            upvotes: rumor.upvotes,
            downvotes: rumor.downvotes,
            userVote: voteType
          }
        });
      }
    } else {
      // Create new vote
      const newVote = new Vote({ rumorId, userFingerprint, voteType });
      await newVote.save();
      
      // Update rumor vote count
      if (voteType === 'upvote') {
        rumor.upvotes += 1;
      } else {
        rumor.downvotes += 1;
      }
      
      await rumor.save();
      
      return res.json({
        success: true,
        message: 'Vote added',
        data: {
          upvotes: rumor.upvotes,
          downvotes: rumor.downvotes,
          userVote: voteType
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing vote',
      error: error.message
    });
  }
});

// Get user's vote for a rumor
router.get('/rumors/:rumorId/vote/:userFingerprint', async (req, res) => {
  try {
    const { rumorId, userFingerprint } = req.params;
    
    const vote = await Vote.findOne({ rumorId, userFingerprint });
    
    res.json({
      success: true,
      data: {
        userVote: vote ? vote.voteType : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vote',
      error: error.message
    });
  }
});

module.exports = router;