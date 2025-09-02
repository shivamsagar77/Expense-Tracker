const Expense = require('../model/Expense');
const Category = require('../model/Category');

exports.addExpense = async (req, res) => {
  try {
    const { user_id, amount, description, category_id } = req.body;
    if (!user_id || !amount || !description || !category_id) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const expense = await Expense.create({ user_id, amount, description, category_id });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Error adding expense', error: err.message });
  }
};

exports.getExpensesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const expenses = await Expense.findAll({
      where: { user_id, deleted_at: null },
      include: [{ model: Category, attributes: ['name'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching expenses', error: err.message });
  }
};
