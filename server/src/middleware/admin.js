const User = require('../models/User');

/**
 * Middleware to verify if the authenticated user has admin role
 * Must be used after requireAuth middleware
 */
async function requireAdmin(req, res, next) {
  try {
    // req.user is populated by requireAuth middleware
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    const user = await User.findById(userId).select('role');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    // Attach user role to request for potential use in controllers
    req.user.role = user.role;
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { requireAdmin };
