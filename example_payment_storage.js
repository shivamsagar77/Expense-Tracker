// Example: Payment Data Storage
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Example payment response data (जैसा आपने दिया है)
const examplePaymentResponse = {
    "success": true,
    "message": "Payment status fetched successfully",
    "data": [
        {
            "auth_id": null,
            "authorization": null,
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

// Payment data store करने का function
async function storePaymentData(token) {
    try {
        console.log('💾 Storing payment data...');
        
        const response = await axios.post(`${BASE_URL}/payment/store`, {
            paymentResponse: examplePaymentResponse
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            console.log('✅ Payment data stored successfully!');
            console.log('Payment ID:', response.data.paymentId);
            return response.data.paymentId;
        } else {
            console.log('❌ Failed to store payment data:', response.data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Error storing payment data:', error.response?.data?.message || error.message);
        return null;
    }
}

// Payment data fetch करने का function
async function getPaymentData(paymentId, token) {
    try {
        console.log(`🔍 Fetching payment data for ID: ${paymentId}`);
        
        const response = await axios.get(`${BASE_URL}/payment/data/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.data.success) {
            console.log('✅ Payment data fetched successfully!');
            console.log('Payment Data:', JSON.stringify(response.data.data, null, 2));
            return response.data.data;
        } else {
            console.log('❌ Failed to fetch payment data:', response.data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching payment data:', error.response?.data?.message || error.message);
        return null;
    }
}

// User के सभी payments fetch करने का function
async function getUserPayments(token) {
    try {
        console.log('👤 Fetching user payments...');
        
        const response = await axios.get(`${BASE_URL}/payment/user-payments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.data.success) {
            console.log('✅ User payments fetched successfully!');
            console.log(`Total payments: ${response.data.data.length}`);
            response.data.data.forEach((payment, index) => {
                console.log(`\nPayment ${index + 1}:`);
                console.log(`- ID: ${payment.id}`);
                console.log(`- Amount: ₹${payment.payment_amount}`);
                console.log(`- Status: ${payment.payment_status}`);
                console.log(`- Method: ${payment.method_type}`);
                console.log(`- Date: ${payment.payment_time}`);
            });
            return response.data.data;
        } else {
            console.log('❌ Failed to fetch user payments:', response.data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching user payments:', error.response?.data?.message || error.message);
        return null;
    }
}

// Main function
async function main() {
    console.log('🚀 Payment Data Storage Example\n');
    
    // Replace with actual token
    const token = 'YOUR_JWT_TOKEN_HERE';
    
    if (token === 'YOUR_JWT_TOKEN_HERE') {
        console.log('❌ Please replace the token with actual JWT token');
        return;
    }
    
    try {
        // 1. Store payment data
        const paymentId = await storePaymentData(token);
        
        if (paymentId) {
            // 2. Fetch stored payment data
            await getPaymentData(paymentId, token);
        }
        
        // 3. Fetch all user payments
        await getUserPayments(token);
        
        console.log('\n✨ Example completed!');
        
    } catch (error) {
        console.error('❌ Example failed:', error.message);
    }
}

// Script run करना
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { storePaymentData, getPaymentData, getUserPayments };
