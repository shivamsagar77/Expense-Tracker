const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PaymentMethodDetail = sequelize.define('PaymentMethodDetail', {
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
    method_type: {
        type: DataTypes.STRING(50), // upi, card, netbanking, etc.
    },
    channel: {
        type: DataTypes.STRING(100),
    },
    upi_id: {
        type: DataTypes.STRING(255),
    },
    upi_instrument: {
        type: DataTypes.STRING(100),
    },
    upi_instrument_number: {
        type: DataTypes.STRING(255),
    },
    upi_payer_account_number: {
        type: DataTypes.STRING(255),
    },
    upi_payer_ifsc: {
        type: DataTypes.STRING(20),
    },
    card_number: {
        type: DataTypes.STRING(20), // Masked card number
    },
    card_type: {
        type: DataTypes.STRING(50),
    },
    card_network: {
        type: DataTypes.STRING(50),
    },
    bank_name: {
        type: DataTypes.STRING(100),
    }
}, {
    tableName: 'payment_method_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PaymentMethodDetail;
