const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Signup = require('./signup');
const Category = require('./Category');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Signup,
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id',
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'expenses',
  timestamps: false,
});

Expense.belongsTo(Signup, { foreignKey: 'user_id' });
Expense.belongsTo(Category, { foreignKey: 'category_id' });

module.exports = Expense;
