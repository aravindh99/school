const express = require('express');
const router = express.Router();
const School = require('../models/School');
const Rumor = require('../models/Rumor');
const { validateSchool, validateRumor } = require('../middleware/validation');

// Get all approved schools
router.get('/', async (req, res) => {
  try {
    const schools = await School.find({ status: 'approved' })
      .select('name city classes createdAt')
      .sort({ createdAt: -1 });
    
    // Add rumor count for each school
    const schoolsWithCounts = await Promise.all(
      schools.map(async (school) => {
        const rumorCount = await Rumor.countDocuments({ schoolId: school._id });
        return {
          ...school.toObject(),
          rumorCount
        };
      })
    );
    
    res.json({
      success: true,
      data: schoolsWithCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching schools',
      error: error.message
    });
  }
});

// Create new school request
router.post('/', validateSchool, async (req, res) => {
  try {
    const { name, city } = req.body;
    
    // Check if school already exists
    const existingSchool = await School.findOne({ 
      name: { $regex: new RegExp(name, 'i') },
      city: { $regex: new RegExp(city, 'i') }
    });
    
    if (existingSchool) {
      return res.status(400).json({
        success: false,
        message: 'School already exists or is pending approval'
      });
    }
    
    const school = new School({ name, city });
    await school.save();
    
    res.status(201).json({
      success: true,
      message: 'School request submitted for approval',
      data: school
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating school request',
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
    
    // Verify school exists and is approved
    const school = await School.findOne({ _id: schoolId, status: 'approved' });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found or not approved'
      });
    }
    
    const rumor = new Rumor({
      schoolId,
      class: rumorClass,
      content
    });
    
    await rumor.save();
    
    res.status(201).json({
      success: true,
      message: 'Rumor posted successfully',
      data: rumor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error posting rumor',
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

module.exports = router;