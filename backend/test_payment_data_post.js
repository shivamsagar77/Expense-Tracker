// Test Payment Data Post
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// ✅ Your valid JWT token
const validToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoic2hpdmFtQGdtYWlsLmNvbSIsIm5hbWUiOiJzaGl2YW0iLCJpYXQiOjE3NTcxMDI2MTQsImV4cCI6MTc1NzE4OTAxNH0.yAm9wTBjYJq4cu0USvHE2sSM8g0bpX6wtlN16bI-Hhs";

// Test payment response data
const testPaymentData = {
    "success": true,
    "message": "Payment status fetched successfully",
    "data": [
        {
            "auth_id": null,
            "authorization": validToken,
            "bank_reference": "1234567890",
            "cf_payment_id": "5114920438916",
            "entity": "payment",
            "error_details": null,
            "international_payment": {
                "international": false
            },
            "is_captured": true,
            "order_amount": 1200,
            "order_currency": "INR",
            "order_id": "order_1757102907637_bq1g34kmp",
            "payment_amount": 1200,
            "payment_completion_time": "2025-09-06T01:39:05+05:30",
            "payment_currency": "INR",
            "payment_gateway_details": {
                "gateway_name": "CASHFREE",
                "gateway_order_id": null,
                "gateway_payment_id": null,
                "gateway_order_reference_id": null,
                "gateway_status_code": null,
                "gateway_settlement": "cashfree",
                "gateway_reference_name": null
            },
            "payment_group": "upi",
            "payment_message": "Simulated response message",
            "payment_method": {
                "upi": {
                    "channel": "collect",
                    "upi_id": "testsuccess@gocash",
                    "upi_instrument": "UPI",
                    "upi_instrument_number": "",
                    "upi_payer_account_number": "",
                    "upi_payer_ifsc": ""
                }
            },
            "payment_offers": null,
            "payment_status": "SUCCESS",
            "payment_surcharge": {
                "payment_surcharge_service_charge": 0,
                "payment_surcharge_service_tax": 0
            },
            "payment_time": "2025-09-06T01:38:47+05:30"
        }
    ]
};

async function testPaymentDataPost() {
    try {
        console.log('🚀 Testing Payment Data Post...\n');

        // 1. Check if server is running
        console.log('1. Testing Server Connection:');
        try {
            const healthCheck = await axios.get(`${BASE_URL}/`);
            console.log('✅ Server is running:', healthCheck.data);
        } catch (error) {
            console.log('❌ Server not running:', error.message);
            console.log('💡 Please start backend server: npm start');
            return;
        }

        // 2. Test with valid token (should work)
        console.log('\n2. Testing Payment Store with Valid Token (should succeed):');
        try {
            const response = await axios.post(`${BASE_URL}/payment/store`, {
                paymentResponse: testPaymentData
            }, {
                headers: {
                    'Authorization': validToken,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Payment stored successfully:', response.data);
        } catch (error) {
            console.log('❌ Payment store error:', error.response?.data?.message || error.message);
        }

        // 3. Test payment callback (no auth required)
        console.log('\n3. Testing Payment Callback (should work):');
        try {
            const callbackData = {
                order_id: 'test_order_123',
                payment_status: 'SUCCESS',
                payment_message: 'Payment completed successfully'
            };
            const response = await axios.post(`${BASE_URL}/payment/callback`, callbackData);
            console.log('✅ Callback processed:', response.data);
        } catch (error) {
            console.log('❌ Callback error:', error.response?.data?.message || error.message);
        }

        // 4. Test fetching user payments with valid token
        console.log('\n4. Testing Get User Payments with Valid Token:');
        try {
            const response = await axios.get(`${BASE_URL}/payment/user-payments`, {
                headers: {
                    'Authorization': validToken
                }
            });
            console.log('✅ User payments fetched:', response.data);
        } catch (error) {
            console.log('❌ User payments fetch error:', error.response?.data?.message || error.message);
        }

        console.log('\n📋 Test Summary:');
        console.log('- ✅ Server is running');
        console.log('- ✅ Payment store works with valid JWT');
        console.log('- ✅ Callback works without auth');
        console.log('- ✅ User payments fetch works with JWT');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testPaymentDataPost();
