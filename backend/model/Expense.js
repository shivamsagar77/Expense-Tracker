const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Sequelize instance

const Expense = sequelize.define('Expense', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  timestamps: true,  // automatically add createdAt and updatedAt
});

module.exports = Expense;
