const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Sequelize instance

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  // Enforces unique constraint on email
    validate: {
      isEmail: true, // Optional: validate format as email
    },
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'students',  // Use the actual table name in your DB
  timestamps: false,      // If you don’t have createdAt, updatedAt columns
});

module.exports = Student;
