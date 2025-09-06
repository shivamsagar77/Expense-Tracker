const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authMiddleware = (req, res, next) => {
  try {
  
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided or invalid format.' 
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    try {
      // Verify token
      const user = jwt.verify(token, JWT_SECRET);
      
      // Add user info to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ 
        message: 'Invalid token.' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      message: 'Internal server error in authentication.' 
    });
  }
};

module.exports = authMiddleware;
