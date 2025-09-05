-- Payment Data Insert Queries
-- आपके response data के अनुसार

-- 1. Main payment record insert
INSERT INTO payments (
    cf_payment_id,
    order_id,
    user_id,
    order_amount,
    order_currency,
    payment_amount,
    payment_currency,
    payment_status,
    payment_message,
    payment_group,
    payment_method,
    is_captured,
    bank_reference,
    auth_id,
    authorizations,
    payment_time,
    payment_completion_time
) VALUES (
    '5114920438916',
    'order_1757102907637_bq1g34kmp',
    1, -- Replace with actual user_id
    1200.00,
    'INR',
    1200.00,
    'INR',
    'SUCCESS',
    'Simulated response message',
    'upi',
    'upi',
    true,
    '1234567890',
    NULL,
    NULL,
    '2025-09-06T01:38:47+05:30',
    '2025-09-06T01:39:05+05:30'
) RETURNING id;

-- 2. Payment gateway details insert
INSERT INTO payment_gateway_details (
    payment_id,
    gateway_name,
    gateway_order_id,
    gateway_payment_id,
    gateway_order_reference_id,
    gateway_status_code,
    gateway_settlement,
    gateway_reference_name
) VALUES (
    1, -- Replace with actual payment_id from above query
    'CASHFREE',
    NULL,
    NULL,
    NULL,
    NULL,
    'cashfree',
    NULL
);

-- 3. Payment method details insert (UPI)
INSERT INTO payment_method_details (
    payment_id,
    method_type,
    channel,
    upi_id,
    upi_instrument,
    upi_instrument_number,
    upi_payer_account_number,
    upi_payer_ifsc
) VALUES (
    1, -- Replace with actual payment_id
    'upi',
    'collect',
    'testsuccess@gocash',
    'UPI',
    '',
    '',
    ''
);

-- 4. Payment surcharge details insert
INSERT INTO payment_surcharge_details (
    payment_id,
    service_charge,
    service_tax,
    total_surcharge
) VALUES (
    1, -- Replace with actual payment_id
    0.00,
    0.00,
    0.00
);

-- 5. International payment details insert
INSERT INTO international_payment_details (
    payment_id,
    is_international,
    country_code,
    exchange_rate,
    original_amount,
    original_currency
) VALUES (
    1, -- Replace with actual payment_id
    false,
    NULL,
    NULL,
    NULL,
    NULL
);

-- 6. Payment offers insert (if any offers applied)
-- INSERT INTO payment_offers (
--     payment_id,
--     offer_id,
--     offer_name,
--     discount_amount,
--     discount_type
-- ) VALUES (
--     1, -- Replace with actual payment_id
--     'OFFER123',
--     'Welcome Offer',
--     50.00,
--     'FIXED'
-- );

-- 7. Error details insert (if any errors)
-- INSERT INTO payment_error_details (
--     payment_id,
--     error_code,
--     error_message,
--     error_type,
--     error_source
-- ) VALUES (
--     1, -- Replace with actual payment_id
--     'ERR001',
--     'Payment failed',
--     'GATEWAY_ERROR',
--     'CASHFREE'
-- );
