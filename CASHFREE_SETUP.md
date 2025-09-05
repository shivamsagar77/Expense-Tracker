# Cashfree Payment Gateway Integration

## Setup Instructions

### Backend Setup

1. **Dependencies Install करें:**
```bash
cd backend
npm install
```

2. **Database Setup करें:**
```bash
# PostgreSQL में payment tables create करें
psql -U your_username -d your_database -f payment_database_schema.sql
```

3. **Environment Variables (Optional):**
आप `.env` file में Cashfree credentials store कर सकते हैं:
```
CASHFREE_APP_ID=TEST430329ae80e0f32e41a393d78b923034
CASHFREE_SECRET_KEY=TESTaf195616268bd6202eeb3bf8dc458956e7192a85
CASHFREE_ENVIRONMENT=SANDBOX
```

4. **Server Start करें:**
```bash
npm start
```

### Frontend Setup

1. **Dependencies Install करें:**
```bash
cd sign_up
npm install
```

2. **Development Server Start करें:**
```bash
npm run dev
```

## API Endpoints

### Payment Routes

1. **Create Order:**
   - **POST** `/payment/create-order`
   - **Headers:** `Authorization: Bearer <token>`
   - **Body:**
   ```json
   {
     "amount": 1200.00,
     "customerId": "user_id_from_localStorage",
     "customerPhone": "9876543210",
     "customerEmail": "user@example.com"
   }
   ```

2. **Get Payment Status:**
   - **GET** `/payment/status/:orderId`
   - **Headers:** `Authorization: Bearer <token>`

3. **Get Order Details:**
   - **GET** `/payment/order/:orderId`
   - **Headers:** `Authorization: Bearer <token>`

4. **Get Order Payments:**
   - **GET** `/payment/payments/:orderId`
   - **Headers:** `Authorization: Bearer <token>`
   - यह `PGOrderFetchPayments` method का उपयोग करता है

5. **Get Payment Session:**
   - **GET** `/payment/session/:paymentSessionId`
   - **Headers:** `Authorization: Bearer <token>`

6. **Payment Callback:**
   - **POST** `/payment/callback`
   - Cashfree से automatic callback आएगा

7. **Store Payment Data:**
   - **POST** `/payment/store`
   - **Headers:** `Authorization: Bearer <token>`
   - **Body:** Payment response data store करने के लिए

8. **Get Payment Data:**
   - **GET** `/payment/data/:paymentId`
   - **Headers:** `Authorization: Bearer <token>`

9. **Get User Payments:**
   - **GET** `/payment/user-payments`
   - **Headers:** `Authorization: Bearer <token>`

## Frontend Usage

1. **Login करें** या **Signup करें**
2. **Payment button** पर click करें (header में)
3. **Payment form** भरें:
   - Amount: ₹1200 (Fixed)
   - Customer ID: Auto-filled from User ID
   - Customer Phone (Required)
   - Customer Email (Optional)
4. **Pay Now** button पर click करें
5. **Cashfree popup** open होगा payment के लिए

## Features

- ✅ **Order Creation** - Backend में order create करता है
- ✅ **Payment Processing** - Cashfree SDK के साथ payment process करता है
- ✅ **Fixed Amount** - ₹1200 fixed amount for all payments
- ✅ **Auto Customer ID** - User ID automatically becomes customer ID
- ✅ **Status Checking** - Payment status check कर सकते हैं
- ✅ **Order Payments Fetch** - `PGOrderFetchPayments` method का उपयोग
- ✅ **Payment Session Fetch** - Payment session details fetch कर सकते हैं
- ✅ **Payment Data Storage** - Complete payment data PostgreSQL में store होता है
- ✅ **Payment History** - User के सभी payments fetch कर सकते हैं
- ✅ **Modal Integration** - Beautiful modal में payment form
- ✅ **Error Handling** - Proper error messages
- ✅ **Authentication** - JWT token based authentication
- ✅ **Responsive Design** - Mobile friendly

## File Structure

```
backend/
├── service/
│   ├── paymentService.js         # Cashfree service logic
│   └── paymentStorageService.js  # Payment data storage logic
├── controller/
│   └── paymentController.js      # Payment API controllers
├── routes/
│   └── payment.js               # Payment routes
└── app.js                       # Main app with payment routes

sign_up/
├── src/
│   ├── components/
│   │   └── PaymentComponent.jsx  # Payment UI component
│   └── App.jsx                   # Main app with payment button
```

## Testing

1. **Backend Test:**
```bash
# Create order
curl -X POST http://localhost:5000/payment/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "customerId": "test123",
    "customerPhone": "9876543210"
  }'
```

2. **Frontend Test:**
- Login करें
- Payment button click करें
- Form भरें और Pay Now करें

## Notes

- **Sandbox Mode** में testing कर रहे हैं
- **Production** के लिए credentials change करें
- **Return URL** configure करें production में
- **Webhook** setup करें payment status के लिए

## Support

अगर कोई issue है तो:
1. Console में errors check करें
2. Network tab में API calls check करें
3. Backend logs check करें
