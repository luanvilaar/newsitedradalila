-- Add fiscal and financial data fields for patient onboarding
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS billing_info JSONB,
ADD COLUMN IF NOT EXISTS financial_info JSONB;