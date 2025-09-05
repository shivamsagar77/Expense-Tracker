# Payment Flow Documentation
## Complete API to Database Table Mapping

### 🔄 Payment Flow Overview

```
User → Frontend → Backend API → Cashfree → Database Tables
```

---

## 📋 API Endpoints & Database Flow

### 1. **Order Creation Flow**

#### API: `POST /payment/create-order`
**Purpose:** Create payment order in Cashfree

**Request Body:**
```json
{
  "amount": 1200,
  "customerId": "user_id_from_localStorage",
  "customerPhone": "9876543210",
  "customerEmail": "user@example.com"
}
```

**Flow:**
1. **Frontend** → Payment form submit
2. **Backend** → `paymentController.createOrder()`
3. **Service** → `paymentService.createOrder()`
4. **Cashfree API** → Order creation
5. **Response** → Payment session ID

**Database Entry:** ❌ No direct database entry (only Cashfree order)

---

### 2. **Payment Processing Flow**

#### API: `POST /payment/store`
**Purpose:** Store complete payment data after successful payment

**Request Body:**
```json
{
  "paymentResponse": {
    "success": true,
    "data": [
      {
        "cf_payment_id": "5114920438916",
        "order_id": "order_1757102907637_bq1g34kmp",
        "payment_amount": 1200,
        "payment_status": "SUCCESS",
        // ... complete payment data
      }
    ]
  }
}
```

**Database Flow:**

#### 🗄️ **Table 1: `payments` (Main Table)**
**Model:** `Payment.js`
**API Method:** `Payment.create()`

**Fields Stored:**
```sql
INSERT INTO payments (
    cf_payment_id,           -- "5114920438916"
    order_id,                -- "order_1757102907637_bq1g34kmp"
    user_id,                 -- From JWT token
    order_amount,            -- 1200.00
    order_currency,          -- "INR"
    payment_amount,          -- 1200.00
    payment_currency,        -- "INR"
    payment_status,          -- "SUCCESS"
    payment_message,         -- "Simulated response message"
    payment_group,           -- "upi"
    payment_method,          -- "upi"
    is_captured,             -- true
    bank_reference,          -- "1234567890"
    auth_id,                 -- null
    authorizations,          -- null (from authorization field)
    payment_time,            -- "2025-09-06T01:38:47+05:30"
    payment_completion_time  -- "2025-09-06T01:39:05+05:30"
)
```

#### 🗄️ **Table 2: `payment_gateway_details`**
**Model:** `PaymentGatewayDetail.js`
**API Method:** `PaymentGatewayDetail.create()`

**Fields Stored:**
```sql
INSERT INTO payment_gateway_details (
    payment_id,                    -- Foreign key to payments.id
    gateway_name,                  -- "CASHFREE"
    gateway_order_id,              -- null
    gateway_payment_id,            -- null
    gateway_order_reference_id,    -- null
    gateway_status_code,           -- null
    gateway_settlement,            -- "cashfree"
    gateway_reference_name         -- null
)
```

#### 🗄️ **Table 3: `payment_method_details`**
**Model:** `PaymentMethodDetail.js`
**API Method:** `PaymentMethodDetail.create()`

**Fields Stored:**
```sql
INSERT INTO payment_method_details (
    payment_id,                -- Foreign key to payments.id
    method_type,               -- "upi"
    channel,                   -- "collect"
    upi_id,                    -- "testsuccess@gocash"
    upi_instrument,            -- "UPI"
    upi_instrument_number,     -- ""
    upi_payer_account_number,  -- ""
    upi_payer_ifsc            -- ""
)
```

#### 🗄️ **Table 4: `payment_surcharge_details`**
**Model:** `PaymentSurchargeDetail.js`
**API Method:** `PaymentSurchargeDetail.create()`

**Fields Stored:**
```sql
INSERT INTO payment_surcharge_details (
    payment_id,        -- Foreign key to payments.id
    service_charge,    -- 0.00
    service_tax,       -- 0.00
    total_surcharge    -- 0.00
)
```

#### 🗄️ **Table 5: `international_payment_details`**
**Model:** `InternationalPaymentDetail.js`
**API Method:** `InternationalPaymentDetail.create()`

**Fields Stored:**
```sql
INSERT INTO international_payment_details (
    payment_id,         -- Foreign key to payments.id
    is_international,   -- false
    country_code,       -- null
    exchange_rate,      -- null
    original_amount,    -- null
    original_currency   -- null
)
```

#### 🗄️ **Table 6: `payment_offers` (Optional)**
**Model:** `PaymentOffer.js`
**API Method:** `PaymentOffer.create()`

**Fields Stored:**
```sql
INSERT INTO payment_offers (
    payment_id,      -- Foreign key to payments.id
    offer_id,        -- null (if no offers)
    offer_name,      -- null
    discount_amount, -- null
    discount_type    -- null
)
```

#### 🗄️ **Table 7: `payment_error_details` (Optional)**
**Model:** `PaymentErrorDetail.js`
**API Method:** `PaymentErrorDetail.create()`

**Fields Stored:**
```sql
INSERT INTO payment_error_details (
    payment_id,    -- Foreign key to payments.id
    error_code,    -- null (if no errors)
    error_message, -- null
    error_type,    -- null
    error_source   -- null
)
```

---

### 3. **Payment Data Retrieval Flow**

#### API: `GET /payment/data/:paymentId`
**Purpose:** Fetch specific payment with all associations

**Database Flow:**
```javascript
Payment.findByPk(paymentId, {
    include: [
        { model: PaymentGatewayDetail, as: 'gatewayDetails' },
        { model: PaymentMethodDetail, as: 'methodDetails' },
        { model: PaymentSurchargeDetail, as: 'surchargeDetails' },
        { model: InternationalPaymentDetail, as: 'internationalDetails' },
        { model: PaymentOffer, as: 'offers' },
        { model: PaymentErrorDetail, as: 'errorDetails' }
    ]
})
```

**Tables Accessed:**
- ✅ `payments` (main record)
- ✅ `payment_gateway_details` (via association)
- ✅ `payment_method_details` (via association)
- ✅ `payment_surcharge_details` (via association)
- ✅ `international_payment_details` (via association)
- ✅ `payment_offers` (via association)
- ✅ `payment_error_details` (via association)

---

### 4. **User Payments Retrieval Flow**

#### API: `GET /payment/user-payments`
**Purpose:** Fetch all payments for logged-in user

**Database Flow:**
```javascript
Payment.findAll({
    where: { user_id: userId },
    include: [
        { model: PaymentGatewayDetail, as: 'gatewayDetails' },
        { model: PaymentMethodDetail, as: 'methodDetails' }
    ],
    order: [['created_at', 'DESC']]
})
```

**Tables Accessed:**
- ✅ `payments` (filtered by user_id)
- ✅ `payment_gateway_details` (via association)
- ✅ `payment_method_details` (via association)

---

### 5. **Payment Status Check Flow**

#### API: `GET /payment/status/:orderId`
**Purpose:** Check payment status from Cashfree

**Database Flow:**
- ❌ No database entry
- 🔄 External API call to Cashfree
- 📤 Response sent back to client

---

### 6. **Payment Callback Flow**

#### API: `POST /payment/callback`
**Purpose:** Handle Cashfree webhook callbacks

**Database Flow:**
- 📝 Log callback data
- 🔄 Update payment status (if needed)
- 📤 Acknowledge callback

---

## 🔄 Complete Payment Transaction Flow

### Step-by-Step Process:

1. **User Login** → JWT token stored in localStorage
2. **Payment Button Click** → Frontend modal opens
3. **Form Submission** → `POST /payment/create-order`
4. **Cashfree Order Creation** → Payment session ID received
5. **Payment Processing** → Cashfree popup/redirect
6. **Payment Success** → Cashfree callback
7. **Data Storage** → `POST /payment/store`
8. **Database Entry** → All 7 tables populated
9. **Confirmation** → Payment ID returned

### Database Transaction Flow:

```javascript
const transaction = await sequelize.transaction();
try {
    // 1. Main payment record
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

## 📊 Data Flow Summary

| API Endpoint | Database Tables | Purpose |
|--------------|----------------|---------|
| `POST /payment/create-order` | ❌ None | Create Cashfree order |
| `POST /payment/store` | ✅ All 7 tables | Store complete payment data |
| `GET /payment/data/:id` | ✅ All 7 tables | Fetch payment with associations |
| `GET /payment/user-payments` | ✅ 3 tables | Fetch user's payment history |
| `GET /payment/status/:orderId` | ❌ None | Check payment status |
| `POST /payment/callback` | 📝 Logs only | Handle webhooks |

---

## 🗂️ File Structure

```
backend/
├── model/
│   ├── Payment.js                    # Main payment model
│   ├── PaymentGatewayDetail.js       # Gateway details model
│   ├── PaymentMethodDetail.js        # Method details model
│   ├── PaymentSurchargeDetail.js     # Surcharge model
│   ├── PaymentOffer.js               # Offers model
│   ├── InternationalPaymentDetail.js # International model
│   ├── PaymentErrorDetail.js         # Error model
│   └── associations.js               # Model relationships
├── service/
│   └── paymentStorageService.js      # ORM storage service
├── controller/
│   └── paymentController.js          # API controllers
└── routes/
    └── payment.js                    # API routes
```

---

## 🚀 Testing Commands

```bash
# Test payment storage
node example_orm_payment_storage.js

# Test payment API
node test_payment_storage.js

# Test payment fetch
node test_payment.js
```

---

## ✅ Key Points

1. **Single API Call** → Multiple table entries
2. **Transaction Safety** → All or nothing approach
3. **ORM Structure** → Sequelize models with associations
4. **Data Integrity** → Foreign key relationships
5. **Complete History** → All payment details stored
6. **Easy Retrieval** → Associations for quick access

**सब कुछ ready है!** यह complete flow documentation है जो बताता है कि कौन सी API से कौन सी table में entry जाएगी।
