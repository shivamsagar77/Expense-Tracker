const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController');

router.get('/', categoryController.getAllCategories);
router.post('/', categoryController.addCategory);

module.exports = router;
