# Payment Quick Reference Guide

## 🚀 Quick API to Table Mapping

### Main Payment Storage API
**`POST /payment/store`** → **7 Database Tables**

| Table Name | Purpose | Key Fields |
|------------|---------|------------|
| `payments` | Main payment record | cf_payment_id, payment_amount, payment_status, authorizations |
| `payment_gateway_details` | Cashfree gateway info | gateway_name, gateway_settlement |
| `payment_method_details` | UPI/Card details | method_type, upi_id, channel |
| `payment_surcharge_details` | Service charges | service_charge, service_tax |
| `international_payment_details` | International flags | is_international |
| `payment_offers` | Applied offers | offer_id, discount_amount |
| `payment_error_details` | Error information | error_code, error_message |

---

## 📋 API Endpoints Summary

| API | Method | Database Impact | Purpose |
|-----|--------|----------------|---------|
| `/payment/create-order` | POST | ❌ None | Create Cashfree order |
| `/payment/store` | POST | ✅ 7 tables | Store complete payment data |
| `/payment/data/:id` | GET | ✅ 7 tables (read) | Fetch payment with associations |
| `/payment/user-payments` | GET | ✅ 3 tables (read) | Fetch user payment history |
| `/payment/status/:orderId` | GET | ❌ None | Check payment status |
| `/payment/callback` | POST | 📝 Logs | Handle webhooks |

---

## 🔄 Payment Flow Steps

1. **User Login** → JWT token
2. **Payment Form** → Phone number entry
3. **Create Order** → `POST /payment/create-order`
4. **Cashfree Payment** → Popup/redirect
5. **Payment Success** → Response received
6. **Store Data** → `POST /payment/store`
7. **Database Entry** → All 7 tables populated
8. **Confirmation** → Payment ID returned

---

## 💾 Database Transaction Flow

```javascript
// Single API call → Multiple table entries
const transaction = await sequelize.transaction();
try {
    // 1. Main payment
    const payment = await Payment.create({...}, { transaction });
    
    // 2. Gateway details
    await PaymentGatewayDetail.create({...}, { transaction });
    
    // 3. Method details
    await PaymentMethodDetail.create({...}, { transaction });
    
    // 4. Surcharge details
    await PaymentSurchargeDetail.create({...}, { transaction });
    
    // 5. International details
    await InternationalPaymentDetail.create({...}, { transaction });
    
    // 6. Offers (if any)
    if (offers) await PaymentOffer.create({...}, { transaction });
    
    // 7. Errors (if any)
    if (errors) await PaymentErrorDetail.create({...}, { transaction });
    
    await transaction.commit();
} catch (error) {
    await transaction.rollback();
}
```

---

## 🗂️ File Structure

```
backend/
├── model/
│   ├── Payment.js                    # Main payment model
│   ├── PaymentGatewayDetail.js       # Gateway details
│   ├── PaymentMethodDetail.js        # Method details
│   ├── PaymentSurchargeDetail.js     # Surcharge details
│   ├── PaymentOffer.js               # Offers
│   ├── InternationalPaymentDetail.js # International
│   ├── PaymentErrorDetail.js         # Errors
│   └── associations.js               # Relationships
├── service/
│   └── paymentStorageService.js      # ORM storage
├── controller/
│   └── paymentController.js          # API controllers
└── routes/
    └── payment.js                    # Routes
```

---

## 🧪 Testing Commands

```bash
# Test ORM payment storage
node example_orm_payment_storage.js

# Test payment API
node test_payment_storage.js

# Test payment flow
node test_payment.js
```

---

## ✅ Key Points

- **Single API Call** → Multiple table entries
- **Transaction Safety** → All or nothing
- **ORM Structure** → Sequelize models
- **Data Integrity** → Foreign key relationships
- **Complete History** → All payment details stored
- **Easy Retrieval** → Associations for quick access

---

## 🔗 Model Relationships

```javascript
Payment.hasMany(PaymentGatewayDetail, { as: 'gatewayDetails' });
Payment.hasMany(PaymentMethodDetail, { as: 'methodDetails' });
Payment.hasMany(PaymentSurchargeDetail, { as: 'surchargeDetails' });
Payment.hasMany(PaymentOffer, { as: 'offers' });
Payment.hasMany(InternationalPaymentDetail, { as: 'internationalDetails' });
Payment.hasMany(PaymentErrorDetail, { as: 'errorDetails' });
User.hasMany(Payment, { as: 'payments' });
```

---

## 📊 Data Flow Summary

**Input:** Payment response from Cashfree
**Output:** Complete payment data in 7 database tables
**Process:** ORM-based transaction with associations
**Result:** Structured, queryable payment history

**सब कुछ ready है!** यह quick reference guide है payment flow के लिए।
