const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PaymentGatewayDetail = sequelize.define('PaymentGatewayDetail', {
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
    gateway_name: {
        type: DataTypes.STRING(100),
    },
    gateway_order_id: {
        type: DataTypes.STRING(255),
    },
    gateway_payment_id: {
        type: DataTypes.STRING(255),
    },
    gateway_order_reference_id: {
        type: DataTypes.STRING(255),
    },
    gateway_status_code: {
        type: DataTypes.STRING(50),
    },
    gateway_settlement: {
        type: DataTypes.STRING(100),
    },
    gateway_reference_name: {
        type: DataTypes.STRING(255),
    }
}, {
    tableName: 'payment_gateway_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PaymentGatewayDetail;
