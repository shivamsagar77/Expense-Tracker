-- Payment Database Schema for PostgreSQL
-- Cashfree Payment Data Storage

-- Main payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    cf_payment_id VARCHAR(255) UNIQUE NOT NULL,
    order_id VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL, -- Foreign key to users table
    order_amount DECIMAL(10,2) NOT NULL,
    order_currency VARCHAR(10) DEFAULT 'INR',
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_currency VARCHAR(10) DEFAULT 'INR',
    payment_status VARCHAR(50) NOT NULL,
    payment_message TEXT,
    payment_group VARCHAR(50),
    payment_method VARCHAR(50),
    is_captured BOOLEAN DEFAULT false,
    bank_reference VARCHAR(255),
    auth_id VARCHAR(255),
    authorizations TEXT,
    payment_time TIMESTAMP WITH TIME ZONE,
    payment_completion_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment gateway details table
CREATE TABLE IF NOT EXISTS payment_gateway_details (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    gateway_name VARCHAR(100),
    gateway_order_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    gateway_order_reference_id VARCHAR(255),
    gateway_status_code VARCHAR(50),
    gateway_settlement VARCHAR(100),
    gateway_reference_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment method details table (for UPI, Card, etc.)
CREATE TABLE IF NOT EXISTS payment_method_details (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    method_type VARCHAR(50), -- upi, card, netbanking, etc.
    channel VARCHAR(100),
    upi_id VARCHAR(255),
    upi_instrument VARCHAR(100),
    upi_instrument_number VARCHAR(255),
    upi_payer_account_number VARCHAR(255),
    upi_payer_ifsc VARCHAR(20),
    card_number VARCHAR(20), -- Masked card number
    card_type VARCHAR(50),
    card_network VARCHAR(50),
    bank_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment surcharge details table
CREATE TABLE IF NOT EXISTS payment_surcharge_details (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    service_charge DECIMAL(10,2) DEFAULT 0,
    service_tax DECIMAL(10,2) DEFAULT 0,
    total_surcharge DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment offers table
CREATE TABLE IF NOT EXISTS payment_offers (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    offer_id VARCHAR(255),
    offer_name VARCHAR(255),
    discount_amount DECIMAL(10,2),
    discount_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- International payment details table
CREATE TABLE IF NOT EXISTS international_payment_details (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    is_international BOOLEAN DEFAULT false,
    country_code VARCHAR(10),
    exchange_rate DECIMAL(10,4),
    original_amount DECIMAL(10,2),
    original_currency VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Error details table
CREATE TABLE IF NOT EXISTS payment_error_details (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    error_code VARCHAR(100),
    error_message TEXT,
    error_type VARCHAR(100),
    error_source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_cf_payment_id ON payments(cf_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_time ON payments(payment_time);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
