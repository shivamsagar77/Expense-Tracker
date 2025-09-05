import React, { useState, useEffect } from 'react';
import { load } from "@cashfreepayments/cashfree-js";
import { Button, Box, Typography, TextField, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

const PaymentComponent = () => {
    const [cashfree, setCashfree] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/payment/create-order', {
                amount: paymentData.amount,
                customerId: userId, // User ID automatically customer ID बन जाएगा
                customerPhone: paymentData.customerPhone,
                customerEmail: paymentData.customerEmail
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
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
                    
                    // Payment status check करना
                    setTimeout(() => {
                        checkPaymentStatus(response.data.data.orderId);
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
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/payment/status/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                console.log('Payment Status:', response.data.data);
                setSuccess(`Payment Status: ${response.data.data[0]?.payment_status || 'Unknown'}`);
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

            <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                    <strong>Payment Details:</strong><br/>
                    • Amount: ₹1200 (Fixed)<br/>
                    • Customer ID: Your User ID (Auto-filled)<br/>
                    • Please enter your phone number to proceed
                </Typography>
            </Alert>

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
                    color="primary"
                    onClick={doPayment}
                    disabled={loading || !cashfree}
                    fullWidth
                    sx={{ mt: 2, py: 1.5 }}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Processing...
                        </>
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
