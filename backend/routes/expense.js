const express = require('express');
const router = express.Router();
const expenseController = require('../controller/expenseController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all expense routes
// router.use(authMiddleware);

router.post('/',authMiddleware, expenseController.addExpense);
router.get('/',authMiddleware, expenseController.getExpensesByUser);
router.delete('/:id',authMiddleware, expenseController.deleteExpense);
// Leaderboard (premium only)
router.get('/leaderboard', authMiddleware, expenseController.getLeaderboard);

module.exports = router;
