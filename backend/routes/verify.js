const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Route to verify JWT token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Token is valid', 
    user: req.user 
  });
});

module.exports = router;
