// Example: PGOrderFetchPayments का उपयोग करना
const { Cashfree, CFEnvironment } = require("cashfree-pg");

// Cashfree instance बनाना
const cashfree = new Cashfree(
    CFEnvironment.SANDBOX, 
    "TEST430329ae80e0f32e41a393d78b923034", 
    "TESTaf195616268bd6202eeb3bf8dc458956e7192a85"
);

// Order payments fetch करने का function
async function fetchOrderPayments(orderId) {
    try {
        console.log(`🔍 Fetching payments for order: ${orderId}`);
        
        const response = await cashfree.PGOrderFetchPayments(orderId);
        
        console.log('✅ Order payments fetched successfully:');
        console.log(JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching order payments:');
        console.error('Error message:', error.response?.data?.message || error.message);
        console.error('Full error:', error);
        return null;
    }
}

// Example usage
async function main() {
    console.log('🚀 Cashfree Payment Fetch Example\n');
    
    // Test order ID (आपको actual order ID use करना होगा)
    const testOrderId = "your-order-id";
    
    // Order payments fetch करना
    const payments = await fetchOrderPayments(testOrderId);
    
    if (payments) {
        console.log('\n📊 Payment Summary:');
        console.log(`Total payments found: ${payments.length || 0}`);
        
        if (payments.length > 0) {
            payments.forEach((payment, index) => {
                console.log(`\nPayment ${index + 1}:`);
                console.log(`- Payment ID: ${payment.cf_payment_id}`);
                console.log(`- Amount: ₹${payment.payment_amount}`);
                console.log(`- Status: ${payment.payment_status}`);
                console.log(`- Method: ${payment.payment_method}`);
                console.log(`- Time: ${payment.payment_time}`);
            });
        }
    }
    
    console.log('\n✨ Example completed!');
}

// Script run करना
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { fetchOrderPayments };
