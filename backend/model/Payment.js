const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    cf_payment_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    order_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    order_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    order_currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'INR',
    },
    payment_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    payment_currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'INR',
    },
    payment_status: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    payment_message: {
        type: DataTypes.TEXT,
    },
    payment_group: {
        type: DataTypes.STRING(50),
    },
    payment_method: {
        type: DataTypes.STRING(50),
    },
    is_captured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    bank_reference: {
        type: DataTypes.STRING(255),
    },
    auth_id: {
        type: DataTypes.STRING(255),
    },
    authorizations: {
        type: DataTypes.TEXT,
    },
    payment_time: {
        type: DataTypes.DATE,
    },
    payment_completion_time: {
        type: DataTypes.DATE,
    }
}, {
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Payment;
