const paymentService = require('../service/paymentService');
const paymentStorageService = require('../service/paymentStorageService');

class PaymentController {
    // Order create करने के लिए controller method
    async createOrder(req, res) {
        try {
            const { amount, customerId, customerPhone, customerEmail, returnUrl } = req.body;
            
            // Validation
            if (!amount || !customerId || !customerPhone) {
                return res.status(400).json({
                    success: false,
                    message: "Amount, customer ID और customer phone required हैं"
                });
            }

            // Unique order ID generate करना
            const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const orderData = {
                amount: parseFloat(amount),
                orderId: orderId,
                customerId: customerId,
                customerPhone: customerPhone,
                customerEmail: customerEmail,
                returnUrl: returnUrl
            };

            const result = await paymentService.createOrder(orderData);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: {
                        orderId: orderId,
                        paymentSessionId: result.data.payment_session_id,
                        orderAmount: result.data.order_amount,
                        orderCurrency: result.data.order_currency
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Payment Controller Error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    // Payment status check करने के लिए controller method
    async getPaymentStatus(req, res) {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: "Order ID required है"
                });
            }

            const result = await paymentService.getPaymentStatus(orderId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Payment Status Controller Error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    // Order details fetch करने के लिए controller method
    async getOrderDetails(req, res) {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: "Order ID required है"
                });
            }

            const result = await paymentService.getOrderDetails(orderId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Order Details Controller Error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    // Order payments fetch करने के लिए controller method
    async fetchOrderPayments(req, res) {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: "Order ID required है"
                });
            }

            const result = await paymentService.fetchOrderPayments(orderId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Fetch Order Payments Controller Error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    // Payment session fetch करने के लिए controller method
    async getPaymentSession(req, res) {
        try {
            const { paymentSessionId } = req.params;

            if (!paymentSessionId) {
                return res.status(400).json({
                    success: false,
                    message: "Payment Session ID required है"
                });
            }

            const result = await paymentService.getPaymentSession(paymentSessionId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Payment Session Controller Error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    // Payment success callback handle करने के लिए method
    async paymentCallback(req, res) {
        try {
            const { order_id, payment_status, payment_message } = req.body;
            
            console.log('Payment Callback Received:', {
                order_id,
                payment_status,
                payment_message
            });

            // यहाँ आप database में payment status update कर सकते हैं
            // या कोई और business logic implement कर सकते हैं

            res.status(200).json({
                success: true,
                message: "Payment callback processed successfully"
            });
        } catch (error) {
            console.error('Payment Callback Error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    // Payment data store करने के लिए method
    async storePaymentData(req, res) {
        try {
            const { paymentResponse } = req.body;
            const userId = req.user.id; // From auth middleware

            if (!paymentResponse || !paymentResponse.data) {
                return res.status(400).json({
                    success: false,
                    message: "Payment response data required है"
                });
            }

            const result = await paymentStorageService.storePaymentData(paymentResponse, userId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    paymentId: result.paymentId
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Store Payment Data Error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    // Payment data fetch करने के लिए method
    async getPaymentData(req, res) {
        try {
            const { paymentId } = req.params;

            if (!paymentId) {
                return res.status(400).json({
                    success: false,
                    message: "Payment ID required है"
                });
            }

            const result = await paymentStorageService.getPaymentData(paymentId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Get Payment Data Error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    // User के सभी payments fetch करने के लिए method
    async getUserPayments(req, res) {
        try {
            const userId = req.user.id; // From auth middleware

            const result = await paymentStorageService.getUserPayments(userId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Get User Payments Error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
}

module.exports = new PaymentController();
