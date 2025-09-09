const Expense = require('../model/Expense');
const Category = require('../model/Category');
const Signup = require('../model/signup');
const { sequelize } = require('../config/db');
const { Transaction } = require('sequelize');
exports.addExpense = async (req, res) => {
  try {
    const { amount, description, category_id } = req.body;
    const user_id = req.user.userId; // Get user ID from JWT token
    const t = await sequelize.transaction();  
    
    if (!amount || !description || !category_id) {
      return res.status(400).json({ message: 'Amount, description, and category are required' });
    }
    // Safely update cumulative total in Signup
    const fetchuser = await Signup.findByPk(user_id);
    const previousTotal = parseFloat(fetchuser?.totalexpene || 0);
    const amountNumber = parseFloat(amount);
    const newTotal = previousTotal + (isNaN(amountNumber) ? 0 : amountNumber);
    await Signup.update({ totalexpene: newTotal }, { where: { id: user_id} },{transaction:t});
    
    const expense = await Expense.create({ user_id, amount, description, category_id },{transaction:t});
    await t.commit();
    res.status(201).json(expense);
  } catch (error) {
    await t.rollback();
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Error adding expense', error: error.message });
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

// Leaderboard: sum of expenses per user (premium only access)
exports.getLeaderboard = async (req, res) => {
  try {
    // Only premium users can view leaderboard
    const isPremium = req.user?.ispremimumuser === true;
    if (!isPremium) {
      return res.status(403).json({ message: 'Premium feature only' });
    }

    // Prefer using accumulated totalexpene to avoid heavy aggregation
    const topUsers = await Signup.findAll({
      attributes: ['id', 'name', 'email', 'totalexpene', 'ispremimumuser'],
      order: [[sequelize.literal('totalexpene'), 'DESC']],
      limit: 50
    });

    return res.json(topUsers);
  } catch (err) {
    console.error('Error generating leaderboard:', err);
    return res.status(500).json({ message: 'Error generating leaderboard', error: err.message });
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

    const fetchuser = await Signup.findByPk(user_id);
    const previousTotal = parseFloat(fetchuser?.totalexpene || 0);
    const amountNumber = parseFloat(expense.amount);
    const newTotal = previousTotal - (isNaN(amountNumber) ? 0 : amountNumber);
    await Signup.update({ totalexpene: newTotal }, { where: { id: user_id } });

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