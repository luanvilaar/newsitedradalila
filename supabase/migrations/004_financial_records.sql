-- Financial records for medical clinic standard (invoices + cashflow)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  record_type TEXT NOT NULL CHECK (record_type IN ('invoice', 'cashflow')),
  transaction_type TEXT CHECK (transaction_type IN ('entry', 'exit')),
  category TEXT,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invoice_number TEXT,
  invoice_status TEXT CHECK (invoice_status IN ('pending', 'issued', 'cancelled')),
  patient_name TEXT,
  patient_document TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT invoice_fields_required CHECK (
    (record_type <> 'invoice') OR (invoice_status IS NOT NULL)
  ),
  CONSTRAINT cashflow_fields_required CHECK (
    (record_type <> 'cashflow') OR (transaction_type IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_financial_records_occurred_at
  ON financial_records (occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_financial_records_record_type
  ON financial_records (record_type);

ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage financial records" ON financial_records
  FOR ALL USING (is_admin());