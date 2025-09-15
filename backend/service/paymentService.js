const { Cashfree, CFEnvironment } = require("cashfree-pg");

class PaymentService {
    constructor() {
        const cashfreeEnv = (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase();
        const clientId = process.env.CASHFREE_CLIENT_ID;
        const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

        const environment = cashfreeEnv === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

        this.cashfree = new Cashfree(environment, clientId, clientSecret);
    }

    // Order create करने के लिए method
    async createOrder(orderData) {
        try {
            const request = {
                "order_amount": orderData.amount,
                "order_currency": "INR",
                "order_id": orderData.orderId,
                "customer_details": {
                    "customer_id": orderData.customerId,
                    "customer_phone": orderData.customerPhone,
                    "customer_email": orderData.customerEmail || ""
                },
                "order_meta": {
                    "return_url": orderData.returnUrl || "https://www.cashfree.com/devstudio/preview/pg/web/popupCheckout?order_id={order_id}"
                }
            };

            const response = await this.cashfree.PGCreateOrder(request);
            return {
                success: true,
                data: response.data,
                message: "Order created successfully"
            };
        } catch (error) {
            console.error('Payment Service Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                message: "Failed to create order"
            };
        }
    }

    // Payment status check करने के लिए method
    async getPaymentStatus(orderId) {
        try {
            const response = await this.cashfree.PGOrderFetchPayments(orderId);
            return {
                success: true,
                data: response.data,
                message: "Payment status fetched successfully"
            };
        } catch (error) {
            console.error('Payment Status Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                message: "Failed to fetch payment status"
            };
        }
    }

    // Order details fetch करने के लिए method
    async getOrderDetails(orderId) {
        try {
            const response = await this.cashfree.PGOrderFetch(orderId);
            return {
                success: true,
                data: response.data,
                message: "Order details fetched successfully"
            };
        } catch (error) {
            console.error('Order Details Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                message: "Failed to fetch order details"
            };
        }
    }

    // Order fetch payments method (जैसा आपने दिया है)
    async fetchOrderPayments(orderId) {
        try {
            const response = await this.cashfree.PGOrderFetchPayments(orderId);
            return {
                success: true,
                data: response.data,
                message: "Order payments fetched successfully"
            };
        } catch (error) {
            console.error('Order Fetch Payments Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                message: "Failed to fetch order payments"
            };
        }
    }

    // Payment session fetch करने के लिए method
    async getPaymentSession(paymentSessionId) {
        try {
            const response = await this.cashfree.PGPaymentSessionFetch(paymentSessionId);
            return {
                success: true,
                data: response.data,
                message: "Payment session fetched successfully"
            };
        } catch (error) {
            console.error('Payment Session Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                message: "Failed to fetch payment session"
            };
        }
    }
}

module.exports = new PaymentService();
