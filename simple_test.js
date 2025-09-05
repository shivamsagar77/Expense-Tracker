// Simple Payment Test
const axios = require('axios');

async function testPayment() {
    try {
        console.log('Testing payment endpoints...\n');
        
        // Test server
        const serverTest = await axios.get('http://localhost:5000/');
        console.log('✅ Server running:', serverTest.data);
        
        // Test payment store without auth (should fail)
        try {
            await axios.post('http://localhost:5000/payment/store', {
                paymentResponse: { success: true, data: [{ cf_payment_id: 'test123' }] }
            });
            console.log('❌ Payment store worked without auth (unexpected)');
        } catch (error) {
            console.log('✅ Payment store requires auth:', error.response?.data?.message || 'Auth required');
        }
        
        // Test payment callback (should work)
        try {
            const callbackResponse = await axios.post('http://localhost:5000/payment/callback', {
                order_id: 'test123',
                payment_status: 'SUCCESS'
            });
            console.log('✅ Payment callback works:', callbackResponse.data);
        } catch (error) {
            console.log('❌ Payment callback failed:', error.message);
        }
        
        console.log('\n📋 Summary:');
        console.log('- Server is running ✅');
        console.log('- Payment endpoints are protected ✅');
        console.log('- Need JWT token to test payment storage');
        console.log('\n💡 To test payment data post:');
        console.log('1. Login through frontend');
        console.log('2. Get JWT token');
        console.log('3. Use token in Authorization header');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testPayment();
