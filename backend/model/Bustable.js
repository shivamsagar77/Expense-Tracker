const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Sequelize instance

const Bustable = sequelize.define('Bustable', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  busNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_busseat: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  avaialabe_seat: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'bustable',
  timestamps: false,
});

module.exports = Bustable;
