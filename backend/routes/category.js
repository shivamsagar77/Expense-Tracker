const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all category routes
// router.use(authMiddleware);

router.get('/',authMiddleware, categoryController.getAllCategories);
router.post('/',authMiddleware, categoryController.addCategory);

module.exports = router;
