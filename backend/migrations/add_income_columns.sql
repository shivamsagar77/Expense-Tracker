-- Add income tracking columns to expenses table
-- This migration adds income_amount, income_description, and income_source columns

ALTER TABLE expenses 
ADD COLUMN income_amount INT DEFAULT 0,
ADD COLUMN income_description TEXT,
ADD COLUMN income_source VARCHAR(255);

-- Update existing records to have default values
UPDATE expenses 
SET income_amount = 0 
WHERE income_amount IS NULL;

-- Add index for better performance on income queries
CREATE INDEX idx_expenses_income_amount ON expenses(income_amount);
CREATE INDEX idx_expenses_user_income ON expenses(user_id, income_amount);
