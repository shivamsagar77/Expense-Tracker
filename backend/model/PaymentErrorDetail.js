const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PaymentErrorDetail = sequelize.define('PaymentErrorDetail', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    payment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'payments',
            key: 'id'
        }
    },
    error_code: {
        type: DataTypes.STRING(100),
    },
    error_message: {
        type: DataTypes.TEXT,
    },
    error_type: {
        type: DataTypes.STRING(100),
    },
    error_source: {
        type: DataTypes.STRING(100),
    }
}, {
    tableName: 'payment_error_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PaymentErrorDetail;
