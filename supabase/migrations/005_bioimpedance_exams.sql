-- Bioimpedance exams history + patient snapshot fields

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS height DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS bmi DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS body_fat_percentage DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS muscle_mass DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS bone_mass DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS visceral_fat INTEGER,
  ADD COLUMN IF NOT EXISTS water_percentage DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS basal_metabolic_rate INTEGER,
  ADD COLUMN IF NOT EXISTS metabolic_age INTEGER,
  ADD COLUMN IF NOT EXISTS bioimpedance_updated_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS bioimpedance_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  bioimpedance_record_id UUID REFERENCES bioimpedance_records(id) ON DELETE SET NULL,
  pdf_path TEXT NOT NULL,
  parsed_data JSONB,
  parser_status TEXT NOT NULL DEFAULT 'pending' CHECK (parser_status IN ('pending', 'success', 'empty', 'failed')),
  parser_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bioimpedance_exams_patient ON bioimpedance_exams(patient_id);
CREATE INDEX IF NOT EXISTS idx_bioimpedance_exams_created_at ON bioimpedance_exams(created_at DESC);

ALTER TABLE bioimpedance_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own bioimpedance exams" ON bioimpedance_exams
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Admins can manage bioimpedance exams" ON bioimpedance_exams
  FOR ALL USING (is_admin());
