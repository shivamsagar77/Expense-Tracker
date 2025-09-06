const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PaymentSurchargeDetail = sequelize.define('PaymentSurchargeDetail', {
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
    service_charge: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    service_tax: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    total_surcharge: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    }
}, {
    tableName: 'payment_surcharge_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PaymentSurchargeDetail;
