const { sequelize } = require('../config/db');
const {
    Payment,
    PaymentGatewayDetail,
    PaymentMethodDetail,
    PaymentSurchargeDetail,
    PaymentOffer,
    InternationalPaymentDetail,
    PaymentErrorDetail
} = require('../model/associations');

class PaymentStorageService {
    
    // Payment data store करने के लिए main method
    async storePaymentData(paymentResponse, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            const paymentData = paymentResponse.data[0]; // First payment from array
            
            // 1. Main payment record insert using ORM
            const payment = await Payment.create({
                cf_payment_id: paymentData.cf_payment_id,
                order_id: paymentData.order_id,
                user_id: userId,
                order_amount: paymentData.order_amount,
                order_currency: paymentData.order_currency,
                payment_amount: paymentData.payment_amount,
                payment_currency: paymentData.payment_currency,
                payment_status: paymentData.payment_status,
                payment_message: paymentData.payment_message,
                payment_group: paymentData.payment_group,
                payment_method: paymentData.payment_method?.upi ? 'upi' : paymentData.payment_method,
                is_captured: paymentData.is_captured,
                bank_reference: paymentData.bank_reference,
                auth_id: paymentData.auth_id,
                authorizations: paymentData.authorization,
                payment_time: paymentData.payment_time,
                payment_completion_time: paymentData.payment_completion_time
            }, { transaction });
            
            const paymentId = payment.id;
            
            // 2. Payment gateway details insert using ORM
            if (paymentData.payment_gateway_details) {
                await PaymentGatewayDetail.create({
                    payment_id: paymentId,
                    gateway_name: paymentData.payment_gateway_details.gateway_name,
                    gateway_order_id: paymentData.payment_gateway_details.gateway_order_id,
                    gateway_payment_id: paymentData.payment_gateway_details.gateway_payment_id,
                    gateway_order_reference_id: paymentData.payment_gateway_details.gateway_order_reference_id,
                    gateway_status_code: paymentData.payment_gateway_details.gateway_status_code,
                    gateway_settlement: paymentData.payment_gateway_details.gateway_settlement,
                    gateway_reference_name: paymentData.payment_gateway_details.gateway_reference_name
                }, { transaction });
            }
            
            // 3. Payment method details insert (UPI) using ORM
            if (paymentData.payment_method?.upi) {
                await PaymentMethodDetail.create({
                    payment_id: paymentId,
                    method_type: 'upi',
                    channel: paymentData.payment_method.upi.channel,
                    upi_id: paymentData.payment_method.upi.upi_id,
                    upi_instrument: paymentData.payment_method.upi.upi_instrument,
                    upi_instrument_number: paymentData.payment_method.upi.upi_instrument_number,
                    upi_payer_account_number: paymentData.payment_method.upi.upi_payer_account_number,
                    upi_payer_ifsc: paymentData.payment_method.upi.upi_payer_ifsc
                }, { transaction });
            }
            
            // 4. Payment surcharge details insert using ORM
            if (paymentData.payment_surcharge) {
                await PaymentSurchargeDetail.create({
                    payment_id: paymentId,
                    service_charge: paymentData.payment_surcharge.payment_surcharge_service_charge,
                    service_tax: paymentData.payment_surcharge.payment_surcharge_service_tax,
                    total_surcharge: paymentData.payment_surcharge.payment_surcharge_service_charge + 
                                   paymentData.payment_surcharge.payment_surcharge_service_tax
                }, { transaction });
            }
            
            // 5. International payment details insert using ORM
            if (paymentData.international_payment) {
                await InternationalPaymentDetail.create({
                    payment_id: paymentId,
                    is_international: paymentData.international_payment.international,
                    country_code: null, // country_code not in response
                    exchange_rate: null, // exchange_rate not in response
                    original_amount: null, // original_amount not in response
                    original_currency: null  // original_currency not in response
                }, { transaction });
            }
            
            // 6. Payment offers insert (if any) using ORM
            if (paymentData.payment_offers) {
                // Handle multiple offers if any
                for (const offer of paymentData.payment_offers) {
                    await PaymentOffer.create({
                        payment_id: paymentId,
                        offer_id: offer.offer_id,
                        offer_name: offer.offer_name,
                        discount_amount: offer.discount_amount,
                        discount_type: offer.discount_type
                    }, { transaction });
                }
            }
            
            // 7. Error details insert (if any errors) using ORM
            if (paymentData.error_details) {
                await PaymentErrorDetail.create({
                    payment_id: paymentId,
                    error_code: paymentData.error_details.error_code,
                    error_message: paymentData.error_details.error_message,
                    error_type: paymentData.error_details.error_type,
                    error_source: paymentData.error_details.error_source
                }, { transaction });
            }
            
            await transaction.commit();
            
            return {
                success: true,
                paymentId: paymentId,
                message: "Payment data stored successfully"
            };
            
        } catch (error) {
            await transaction.rollback();
            console.error('Payment Storage Error:', error);
            return {
                success: false,
                error: error.message,
                message: "Failed to store payment data"
            };
        }
    }
    
    // Payment data fetch करने के लिए method using ORM
    async getPaymentData(paymentId) {
        try {
            const payment = await Payment.findByPk(paymentId, {
                include: [
                    {
                        model: PaymentGatewayDetail,
                        as: 'gatewayDetails'
                    },
                    {
                        model: PaymentMethodDetail,
                        as: 'methodDetails'
                    },
                    {
                        model: PaymentSurchargeDetail,
                        as: 'surchargeDetails'
                    },
                    {
                        model: InternationalPaymentDetail,
                        as: 'internationalDetails'
                    },
                    {
                        model: PaymentOffer,
                        as: 'offers'
                    },
                    {
                        model: PaymentErrorDetail,
                        as: 'errorDetails'
                    }
                ]
            });
            
            return {
                success: true,
                data: payment,
                message: "Payment data fetched successfully"
            };
            
        } catch (error) {
            console.error('Payment Fetch Error:', error);
            return {
                success: false,
                error: error.message,
                message: "Failed to fetch payment data"
            };
        }
    }
    
    // User के सभी payments fetch करने के लिए method using ORM
    async getUserPayments(userId) {
        try {
            const payments = await Payment.findAll({
                where: { user_id: userId },
                include: [
                    {
                        model: PaymentGatewayDetail,
                        as: 'gatewayDetails'
                    },
                    {
                        model: PaymentMethodDetail,
                        as: 'methodDetails'
                    }
                ],
                order: [['created_at', 'DESC']]
            });
            
            return {
                success: true,
                data: payments,
                message: "User payments fetched successfully"
            };
            
        } catch (error) {
            console.error('User Payments Fetch Error:', error);
            return {
                success: false,
                error: error.message,
                message: "Failed to fetch user payments"
            };
        }
    }
}

module.exports = new PaymentStorageService();
