// Payment Model Associations
const Payment = require('./Payment');
const PaymentGatewayDetail = require('./PaymentGatewayDetail');
const PaymentMethodDetail = require('./PaymentMethodDetail');
const PaymentSurchargeDetail = require('./PaymentSurchargeDetail');
const PaymentOffer = require('./PaymentOffer');
const InternationalPaymentDetail = require('./InternationalPaymentDetail');
const PaymentErrorDetail = require('./PaymentErrorDetail');
const User = require('./user');

// Payment associations
Payment.hasMany(PaymentGatewayDetail, { 
    foreignKey: 'payment_id', 
    as: 'gatewayDetails' 
});
PaymentGatewayDetail.belongsTo(Payment, { 
    foreignKey: 'payment_id', 
    as: 'payment' 
});

Payment.hasMany(PaymentMethodDetail, { 
    foreignKey: 'payment_id', 
    as: 'methodDetails' 
});
PaymentMethodDetail.belongsTo(Payment, { 
    foreignKey: 'payment_id', 
    as: 'payment' 
});

Payment.hasMany(PaymentSurchargeDetail, { 
    foreignKey: 'payment_id', 
    as: 'surchargeDetails' 
});
PaymentSurchargeDetail.belongsTo(Payment, { 
    foreignKey: 'payment_id', 
    as: 'payment' 
});

Payment.hasMany(PaymentOffer, { 
    foreignKey: 'payment_id', 
    as: 'offers' 
});
PaymentOffer.belongsTo(Payment, { 
    foreignKey: 'payment_id', 
    as: 'payment' 
});

Payment.hasMany(InternationalPaymentDetail, { 
    foreignKey: 'payment_id', 
    as: 'internationalDetails' 
});
InternationalPaymentDetail.belongsTo(Payment, { 
    foreignKey: 'payment_id', 
    as: 'payment' 
});

Payment.hasMany(PaymentErrorDetail, { 
    foreignKey: 'payment_id', 
    as: 'errorDetails' 
});
PaymentErrorDetail.belongsTo(Payment, { 
    foreignKey: 'payment_id', 
    as: 'payment' 
});

// User associations
User.hasMany(Payment, { 
    foreignKey: 'user_id', 
    as: 'payments' 
});
Payment.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
});

module.exports = {
    Payment,
    PaymentGatewayDetail,
    PaymentMethodDetail,
    PaymentSurchargeDetail,
    PaymentOffer,
    InternationalPaymentDetail,
    PaymentErrorDetail,
    User
};
