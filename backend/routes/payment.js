const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const authMiddleware = require('../middleware/auth');

// Payment routes

// Order create करने के लिए route
router.post('/create-order', paymentController.createOrder);

// Payment status check करने के लिए route
router.get('/status/:orderId', paymentController.getPaymentStatus);

// Order details fetch करने के लिए route
router.get('/order/:orderId', paymentController.getOrderDetails);

// Order payments fetch करने के लिए route (जैसा आपने दिया है)
router.get('/payments/:orderId', paymentController.fetchOrderPayments);

// Payment session fetch करने के लिए route
router.get('/session/:paymentSessionId', paymentController.getPaymentSession);

// Payment callback handle करने के लिए route (Cashfree से callback आएगा)
router.post('/callback', paymentController.paymentCallback);

// Payment data store करने के लिए route
router.post('/store', paymentController.storePaymentData);

// Payment data fetch करने के लिए route
router.get('/data/:paymentId', paymentController.getPaymentData);

// User के सभी payments fetch करने के लिए route
router.get('/user-payments', paymentController.getUserPayments);

module.exports = router;
