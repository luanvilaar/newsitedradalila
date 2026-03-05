-- Stock movements for medication inventory
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entry', 'exit')),
  medication_name TEXT NOT NULL,
  quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL DEFAULT 'un',
  supplier_name TEXT NOT NULL,
  supplier_document TEXT,
  supplier_contact TEXT,
  batch_code TEXT,
  expiry_date DATE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_occurred_at
  ON stock_movements (occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_movements_medication
  ON stock_movements (medication_name);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage stock movements" ON stock_movements
  FOR ALL USING (is_admin());
