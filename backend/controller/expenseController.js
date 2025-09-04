const Expense = require('../model/Expense');
const Category = require('../model/Category');

exports.addExpense = async (req, res) => {
  try {
    const { amount, description, category_id } = req.body;
    const user_id = req.user.userId; // Get user ID from JWT token
    
    if (!amount || !description || !category_id) {
      return res.status(400).json({ message: 'Amount, description, and category are required' });
    }
    
    const expense = await Expense.create({ user_id, amount, description, category_id });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Error adding expense', error: err.message });
  }
};

exports.getExpensesByUser = async (req, res) => {
  try {
    const user_id = req.user.userId; // Get user ID from JWT token
    
    const expenses = await Expense.findAll({
      where: { user_id, deleted_at: null },
      include: [{ 
        model: Category, 
        as: 'Category',
        attributes: ['name'] 
      }],
      order: [['created_at', 'DESC']]
    });

    console.log('Fetched expenses for user:', user_id, 'Count:', expenses.length);
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ message: 'Error fetching expenses', error: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId; // Get user ID from JWT token
    
    // Check if expense exists and belongs to the user
    const expense = await Expense.findOne({
      where: { id, user_id, deleted_at: null }
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or already deleted' });
    }
    
    // Soft delete by setting deleted_at timestamp
    await Expense.update(
      { deleted_at: new Date() },
      { where: { id, user_id } }
    );
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ message: 'Error deleting expense', error: err.message });
  }
};