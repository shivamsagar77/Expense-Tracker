const express = require('express');
const router = express.Router();
const expenseController = require('../controller/expenseController');

router.post('/', expenseController.addExpense);
router.get('/:user_id', expenseController.getExpensesByUser);

module.exports = router;
