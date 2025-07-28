const express = require('express');
const router = express.Router();
const School = require('../models/School');
const { adminAuth, requireAdmin } = require('../middleware/auth');

// Admin login
router.post('/login', adminAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Admin login successful',
    token: 'admin-authenticated' // Simple token for MVP
  });
});

// Get pending institution requests
router.get('/schools/pending', requireAdmin, async (req, res) => {
  try {
    const pendingInstitutions = await School.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: pendingInstitutions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending institutions',
      error: error.message
    });
  }
});

// Get all institutions (for admin overview)
router.get('/schools', requireAdmin, async (req, res) => {
  try {
    const institutions = await School.find()
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: institutions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching institutions',
      error: error.message
    });
  }
});

// Approve school request
router.put('/schools/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    
    if (school.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'School is not pending approval'
      });
    }
    
    // Approve institution and add classes (only for schools)
    school.status = 'approved';
    if (school.type === 'school') {
      school.classes = ['7', '8', '9', '10', '11', '12'];
    } else {
      school.classes = []; // Colleges don't have classes
    }
    school.approvedAt = new Date();
    
    await school.save();
    
    res.json({
      success: true,
      message: 'School approved successfully',
      data: school
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving school',
      error: error.message
    });
  }
});

// Reject school request
router.delete('/schools/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    
    if (school.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'School is not pending approval'
      });
    }
    
    await School.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'School request rejected and removed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting school',
      error: error.message
    });
  }
});

// Get admin stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const Rumor = require('../models/Rumor');
    
    const totalSchools = await School.countDocuments({ status: 'approved' });
    const totalRumors = await Rumor.countDocuments();
    const recentRumors = await Rumor.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    // Get recent rumors with school info
    const rumors = await Rumor.find()
      .populate('schoolId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: {
        totalSchools,
        totalRumors,
        recentRumors,
        rumors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin stats',
      error: error.message
    });
  }
});

// Delete rumor
router.delete('/rumors/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const Rumor = require('../models/Rumor');
    
    const rumor = await Rumor.findById(id);
    if (!rumor) {
      return res.status(404).json({
        success: false,
        message: 'Rumor not found'
      });
    }
    
    await Rumor.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Rumor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting rumor',
      error: error.message
    });
  }
});

// Edit rumor
router.put('/rumors/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const Rumor = require('../models/Rumor');
    
    if (!content || content.trim().length < 10 || content.trim().length > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Content must be between 10 and 10000 characters'
      });
    }
    
    const rumor = await Rumor.findByIdAndUpdate(
      id,
      { content: content.trim() },
      { new: true }
    );
    
    if (!rumor) {
      return res.status(404).json({
        success: false,
        message: 'Rumor not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Rumor updated successfully',
      data: rumor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating rumor',
      error: error.message
    });
  }
});

// Edit school
router.put('/schools/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city } = req.body;
    
    if (!name || !city) {
      return res.status(400).json({
        success: false,
        message: 'Name and city are required'
      });
    }
    
    const school = await School.findByIdAndUpdate(
      id,
      { name: name.trim(), city: city.trim() },
      { new: true }
    );
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    
    res.json({
      success: true,
      message: 'School updated successfully',
      data: school
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating school',
      error: error.message
    });
  }
});

// Delete school
router.delete('/schools/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const Rumor = require('../models/Rumor');
    
    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    
    // Delete all rumors for this school
    await Rumor.deleteMany({ schoolId: id });
    
    // Delete the school
    await School.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'School and all its threads deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting school',
      error: error.message
    });
  }
});

// Admin create institution directly (auto-approved)
router.post('/schools', requireAdmin, async (req, res) => {
  try {
    const { name, city, type = 'school' } = req.body;
    
    if (!name || !city) {
      return res.status(400).json({
        success: false,
        message: 'Name and city are required'
      });
    }
    
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
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} already exists`
      });
    }
    
    const institutionData = {
      name: name.trim(),
      city: city.trim(),
      type: type,
      status: 'approved',
      approvedAt: new Date()
    };
    
    // Only add classes for schools, not colleges
    if (type === 'school') {
      institutionData.classes = ['7', '8', '9', '10', '11', '12'];
    } else {
      institutionData.classes = [];
    }
    
    const institution = new School(institutionData);
    await institution.save();
    
    res.status(201).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully`,
      data: institution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error creating ${req.body.type || 'institution'}`,
      error: error.message
    });
  }
});

// Get threads for a specific school (admin view)
router.get('/schools/:id/threads', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const Rumor = require('../models/Rumor');
    
    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    
    const threads = await Rumor.find({ schoolId: id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        school,
        threads
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching school threads',
      error: error.message
    });
  }
});

// Get all suggestions
router.get('/suggestions', requireAdmin, async (req, res) => {
  try {
    const Suggestion = require('../models/Suggestion');
    
    const suggestions = await Suggestion.find()
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestions',
      error: error.message
    });
  }
});

// Delete suggestion
router.delete('/suggestions/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const Suggestion = require('../models/Suggestion');
    
    const suggestion = await Suggestion.findById(id);
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }
    
    await Suggestion.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Suggestion deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting suggestion',
      error: error.message
    });
  }
});

// Get announcement
router.get('/announcement', requireAdmin, async (req, res) => {
  try {
    const Announcement = require('../models/Announcement');
    const announcement = await Announcement.getAnnouncement();
    
    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching announcement',
      error: error.message
    });
  }
});

// Update announcement
router.put('/announcement', requireAdmin, async (req, res) => {
  try {
    const { content } = req.body;
    const Announcement = require('../models/Announcement');
    
    const announcement = await Announcement.updateAnnouncement(content || '');
    
    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating announcement',
      error: error.message
    });
  }
});

module.exports = router;