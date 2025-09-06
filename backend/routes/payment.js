const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const authMiddleware = require('../middleware/auth');

// Payment routes

// Order create करने के लिए route
router.post('/create-order',authMiddleware, paymentController.createOrder);

// Payment status check करने के लिए route
router.get('/status/:orderId',authMiddleware, paymentController.getPaymentStatus);

// Order details fetch करने के लिए route
router.get('/order/:orderId', authMiddleware, paymentController.getOrderDetails);

// Order payments fetch करने के लिए route (जैसा आपने दिया है)
router.get('/payments/:orderId', authMiddleware, paymentController.fetchOrderPayments);

// Payment session fetch करने के लिए route
router.get('/session/:paymentSessionId', authMiddleware, paymentController.getPaymentSession);

// Payment callback handle करने के लिए route (Cashfree से callback आएगा)
// Auth middleware optional - callback में customer_id भी हो सकता है
router.post('/callback', authMiddleware, paymentController.paymentCallback);

// Payment data store करने के लिए route
router.post('/store', authMiddleware, paymentController.storePaymentData);

// Payment data fetch करने के लिए route
router.get('/data/:paymentId', authMiddleware,  paymentController.getPaymentData);

// User के सभी payments fetch करने के लिए route
router.get('/user-payments', authMiddleware, paymentController.getUserPayments);

// User का premium status check करने के लिए route
router.get('/premium-status', authMiddleware, paymentController.getUserPremiumStatus);

// Payment success के बाद token refresh करने के लिए route
router.post('/refresh-token', authMiddleware, paymentController.refreshTokenAfterPayment);

// Payment success के बाद user को premium बनाने के लिए route
router.post('/update-to-premium', authMiddleware,   paymentController.updateUserToPremium);

module.exports = router;
