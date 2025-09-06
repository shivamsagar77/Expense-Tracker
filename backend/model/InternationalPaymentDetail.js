const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InternationalPaymentDetail = sequelize.define('InternationalPaymentDetail', {
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
    is_international: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    country_code: {
        type: DataTypes.STRING(10),
    },
    exchange_rate: {
        type: DataTypes.DECIMAL(10, 4),
    },
    original_amount: {
        type: DataTypes.DECIMAL(10, 2),
    },
    original_currency: {
        type: DataTypes.STRING(10),
    }
}, {
    tableName: 'international_payment_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = InternationalPaymentDetail;
