// Apply migration 005 via Supabase Management API (pg-meta)
// Run: node scripts/apply-migration-005-fetch.js

const PROJECT_REF = 'jcvjaiufrbqclcxproee';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjdmphaXVmcmJxY2xjeHByb2VlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5ODYwMiwiZXhwIjoyMDg4MDc0NjAyfQ._FVTBWDshPwJjMoVa7MXB8Dc1ocF-MaLP28rV75dehI';

const SQL = `
-- Add bioimpedance columns to patients
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

-- Create bioimpedance_exams table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bioimpedance_exams_patient ON bioimpedance_exams(patient_id);
CREATE INDEX IF NOT EXISTS idx_bioimpedance_exams_created_at ON bioimpedance_exams(created_at DESC);

-- RLS
ALTER TABLE bioimpedance_exams ENABLE ROW LEVEL SECURITY;

-- Policies (use DO block to avoid error if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bioimpedance_exams' AND policyname = 'Patients can view own bioimpedance exams'
  ) THEN
    CREATE POLICY "Patients can view own bioimpedance exams" ON bioimpedance_exams
      FOR SELECT USING (patient_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bioimpedance_exams' AND policyname = 'Admins can manage bioimpedance exams'
  ) THEN
    CREATE POLICY "Admins can manage bioimpedance exams" ON bioimpedance_exams
      FOR ALL USING (is_admin());
  END IF;
END $$;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
`;

async function run() {
  console.log('Applying migration via Supabase pg-meta API...\n');

  const url = `https://${PROJECT_REF}.supabase.co/pg/query`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'X-Supabase-Api-Version': '2024-01-01',
    },
    body: JSON.stringify({ query: SQL }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.log(`HTTP ${res.status}: ${text}`);
    
    // Try alternative endpoint
    console.log('\nTrying alternative endpoint...');
    const altUrl = `https://${PROJECT_REF}.supabase.co/rest/v1/rpc/`;
    
    // Fall back to individual statements via /pg
    console.log('\nPlease run the following SQL in the Supabase Dashboard SQL Editor:');
    console.log('URL: https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
    console.log('\n--- SQL ---\n');
    console.log(SQL);
    return;
  }

  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
  
  // Verify
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(`https://${PROJECT_REF}.supabase.co`, SERVICE_KEY);
  
  // Wait for schema cache reload
  console.log('\nWaiting for schema cache reload...');
  await new Promise(r => setTimeout(r, 3000));
  
  const { data: check, error } = await supabase.from('bioimpedance_exams').select('id').limit(0);
  if (error) {
    console.log('❌ Table still not accessible:', error.message);
    console.log('Schema cache may need more time to reload. Try again in ~10 seconds.');
  } else {
    console.log('✅ bioimpedance_exams table is ready!');
  }
}

run().catch(console.error);
