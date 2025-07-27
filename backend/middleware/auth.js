// Simple admin authentication middleware
const adminAuth = (req, res, next) => {
  const { username, password } = req.body;
  
  // Hardcoded credentials for MVP
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.isAdmin = true;
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid admin credentials'
    });
  }
};

// Middleware to check if user is authenticated admin (for protected routes)
const requireAdmin = (req, res, next) => {
  // For simplicity, we'll use a basic token approach
  const token = req.headers.authorization;
  
  if (token === 'admin-authenticated') {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }
};

module.exports = { adminAuth, requireAdmin };