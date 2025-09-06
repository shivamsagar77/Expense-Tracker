const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PaymentOffer = sequelize.define('PaymentOffer', {
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
    offer_id: {
        type: DataTypes.STRING(255),
    },
    offer_name: {
        type: DataTypes.STRING(255),
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
    },
    discount_type: {
        type: DataTypes.STRING(50),
    }
}, {
    tableName: 'payment_offers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PaymentOffer;
