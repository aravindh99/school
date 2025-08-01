const express = require('express');
const router = express.Router();

// Simple ping endpoint for cron jobs to keep server awake
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is awake',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;