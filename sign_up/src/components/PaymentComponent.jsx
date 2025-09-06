import React, { useState, useEffect } from 'react';
import { load } from "@cashfreepayments/cashfree-js";
import { Button, Box, Typography, TextField, Alert, CircularProgress, Chip } from '@mui/material';
import { paymentAPI } from '../utils/api';

const PaymentComponent = () => {
    const [cashfree, setCashfree] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [ispremimumuser, setispremimumuser] = useState(false);
    const [premiumLoading, setPremiumLoading] = useState(false);
    const [paymentData, setPaymentData] = useState({
        amount: 1200, // Fixed amount
        customerPhone: '',
        customerEmail: ''
    });

    // Cashfree SDK initialize करना
    useEffect(() => {
        const initializeSDK = async () => {
            try {
                const cf = await load({
                    mode: "sandbox"
                });
                setCashfree(cf);
            } catch (error) {
                console.error('Cashfree SDK initialization error:', error);
                setError('Payment SDK initialization failed');
            }
        };
        initializeSDK();
    }, []);

    // JWT token से premium status extract करने के लिए function
    const getPremiumStatusFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // JWT token decode करना (without verification - just for reading)
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.ispremimumuser || false;
            }
        } catch (error) {
            console.error('Token decode error:', error);
        }
        return false;
    };

    // Premium status check करने के लिए function
    const checkPremiumStatus = async () => {
        try {
            setPremiumLoading(true);
            
            // पहले JWT token से check करना (faster)
            const tokenPremiumStatus = getPremiumStatusFromToken();
            setispremimumuser(tokenPremiumStatus);
            
            // फिर API से verify करना (optional)
            const response = await paymentAPI.getPremiumStatus();
            if (response.data.success) {
                setispremimumuser(response.data.data.ispremimumuser);
            }
        } catch (error) {
            console.error('Premium status check error:', error);
        } finally {
            setPremiumLoading(false);
        }
    };

    // Component mount होने पर premium status check करना
    useEffect(() => {
        checkPremiumStatus();
    }, []);

    // Input handle करने के लिए function
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Payment process करने के लिए main function
    const doPayment = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Validation
            if (!paymentData.customerPhone) {
                setError('कृपया customer phone भरें');
                setLoading(false);
                return;
            }

            // User ID automatically customer ID के रूप में use करना
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setError('User not logged in');
                setLoading(false);
                return;
            }

            // Backend से order create करना
            const response = await paymentAPI.createOrder({
                amount: paymentData.amount,
                customerId: userId, // User ID automatically customer ID बन जाएगा
                customerPhone: paymentData.customerPhone,
                customerEmail: paymentData.customerEmail
            });

            if (response.data.success) {
                const { paymentSessionId } = response.data.data;
                
                // Cashfree checkout process
                const checkoutOptions = {
                    paymentSessionId: paymentSessionId,
                    redirectTarget: "_modal",
                };

                const result = await cashfree.checkout(checkoutOptions);
                
                if (result.error) {
                    setError('Payment failed या user ने popup close कर दिया');
                    console.log("Payment Error:", result.error);
                } else if (result.redirect) {
                    setSuccess('Payment redirect हो रहा है');
                    console.log("Payment will be redirected");
                } else if (result.paymentDetails) {
                    setSuccess('Payment completed successfully!');
                    console.log("Payment Details:", result.paymentDetails);
                    
                    // Payment status check करना और premium status update करना
                    setTimeout(() => {
                        checkPaymentStatus(response.data.data.orderId);
                        // Premium status भी check करना
                        setTimeout(async () => {
                            // Token refresh करना payment success के बाद
                            try {
                                const refreshResponse = await paymentAPI.refreshToken();
                                if (refreshResponse.data.success) {
                                    // New token को localStorage में save करना
                                    localStorage.setItem('token', refreshResponse.data.data.token);
                                    console.log('Token refreshed after payment success');
                                }
                            } catch (refreshError) {
                                console.error('Token refresh error:', refreshError);
                            }
                            
                            checkPremiumStatus();
                        }, 3000);
                    }, 2000);
                }
            } else {
                setError(response.data.message || 'Order creation failed');
            }
        } catch (error) {
            console.error('Payment Error:', error);
            setError(error.response?.data?.message || 'Payment process failed');
        } finally {
            setLoading(false);
        }
    };

    // Payment status check करने के लिए function
    const checkPaymentStatus = async (orderId) => {
        try {
            const response = await paymentAPI.getPaymentStatus(orderId);

            if (response.data.success) {
                console.log('Payment Status:', response.data.data);
                const paymentStatus = response.data.data[0]?.payment_status || 'Unknown';
                setSuccess(`Payment Status: ${paymentStatus}`);
                
                // अगर payment successful है तो premium status check करना
                if (paymentStatus === 'SUCCESS') {
                    setTimeout(async () => {
                        // Token refresh करना payment success के बाद
                        try {
                            const refreshResponse = await paymentAPI.refreshToken();
                            if (refreshResponse.data.success) {
                                // New token को localStorage में save करना
                                localStorage.setItem('token', refreshResponse.data.data.token);
                                console.log('Token refreshed after payment success');
                            }
                        } catch (refreshError) {
                            console.error('Token refresh error:', refreshError);
                        }
                        
                        // Premium status check करना
                        checkPremiumStatus();
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Status Check Error:', error);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, margin: 'auto', padding: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
                Payment - ₹1200
            </Typography>

            {/* Premium Status Display */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {premiumLoading ? (
                    <CircularProgress size={20} />
                ) : (
                    <Chip
                        label={ispremimumuser ? "🌟 Premium User" : "👤 Regular User"}
                        color={ispremimumuser ? "success" : "default"}
                        variant={ispremimumuser ? "filled" : "outlined"}
                        sx={{ fontWeight: 'bold' }}
                    />
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {ispremimumuser ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>🎉 Congratulations! You are a Premium User!</strong><br/>
                        • You have access to all premium features<br/>
                        • No need to pay again<br/>
                        • Enjoy your premium experience!
                    </Typography>
                </Alert>
            ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Payment Details:</strong><br/>
                        • Amount: ₹1200 (Fixed)<br/>
                        • Customer ID: Your User ID (Auto-filled)<br/>
                        • Please enter your phone number to proceed
                    </Typography>
                </Alert>
            )}

            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Amount (₹)"
                    name="amount"
                    type="number"
                    value={paymentData.amount}
                    disabled
                    fullWidth
                    helperText="Fixed amount for this payment"
                />

                <TextField
                    label="Customer Phone"
                    name="customerPhone"
                    value={paymentData.customerPhone}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    placeholder="Enter your phone number"
                />

                <TextField
                    label="Customer Email"
                    name="customerEmail"
                    type="email"
                    value={paymentData.customerEmail}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="Enter your email (optional)"
                />

                <Button
                    variant="contained"
                    color={ispremimumuser ? "success" : "primary"}
                    onClick={doPayment}
                    disabled={loading || !cashfree || ispremimumuser}
                    fullWidth
                    sx={{ mt: 2, py: 1.5 }}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Processing...
                        </>
                    ) : ispremimumuser ? (
                        '✅ Already Premium User'
                    ) : (
                        'Pay Now'
                    )}
                </Button>
            </Box>

            {!cashfree && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                    Payment SDK loading...
                </Typography>
            )}
        </Box>
    );
};

export default PaymentComponent;
