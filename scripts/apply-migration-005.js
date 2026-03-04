const { createClient } = require('@supabase/supabase-js');

const url = 'https://jcvjaiufrbqclcxproee.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjdmphaXVmcmJxY2xjeHByb2VlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5ODYwMiwiZXhwIjoyMDg4MDc0NjAyfQ._FVTBWDshPwJjMoVa7MXB8Dc1ocF-MaLP28rV75dehI';

const supabase = createClient(url, serviceKey);

async function applyMigration() {
  console.log('Applying migration: 005_bioimpedance_exams...\n');

  // Step 1: Add columns to patients table
  const alterPatients = `
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
  `;

  const { error: e1 } = await supabase.rpc('exec_sql', { sql: alterPatients });
  if (e1) {
    console.log('ALTER patients (trying direct):', e1.message);
  } else {
    console.log('✓ ALTER patients: columns added');
  }

  // Step 2: Create bioimpedance_exams table
  const createTable = `
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
  `;

  const { error: e2 } = await supabase.rpc('exec_sql', { sql: createTable });
  if (e2) {
    console.log('CREATE TABLE (trying direct):', e2.message);
  } else {
    console.log('✓ CREATE TABLE bioimpedance_exams');
  }

  // Step 3: Indexes
  const indexes = `
    CREATE INDEX IF NOT EXISTS idx_bioimpedance_exams_patient ON bioimpedance_exams(patient_id);
    CREATE INDEX IF NOT EXISTS idx_bioimpedance_exams_created_at ON bioimpedance_exams(created_at DESC);
  `;
  const { error: e3 } = await supabase.rpc('exec_sql', { sql: indexes });
  if (e3) {
    console.log('CREATE INDEXES:', e3.message);
  } else {
    console.log('✓ Indexes created');
  }

  // Step 4: Enable RLS
  const rls = `ALTER TABLE bioimpedance_exams ENABLE ROW LEVEL SECURITY;`;
  const { error: e4 } = await supabase.rpc('exec_sql', { sql: rls });
  if (e4) {
    console.log('ENABLE RLS:', e4.message);
  } else {
    console.log('✓ RLS enabled');
  }

  // Step 5: Policies
  const policySelect = `
    CREATE POLICY "Patients can view own bioimpedance exams" ON bioimpedance_exams
      FOR SELECT USING (patient_id = auth.uid());
  `;
  const { error: e5 } = await supabase.rpc('exec_sql', { sql: policySelect });
  if (e5) {
    console.log('POLICY SELECT:', e5.message);
  } else {
    console.log('✓ SELECT policy added');
  }

  const policyAll = `
    CREATE POLICY "Admins can manage bioimpedance exams" ON bioimpedance_exams
      FOR ALL USING (is_admin());
  `;
  const { error: e6 } = await supabase.rpc('exec_sql', { sql: policyAll });
  if (e6) {
    console.log('POLICY ALL:', e6.message);
  } else {
    console.log('✓ ALL policy added (admins)');
  }

  // Verify
  console.log('\n--- Verification ---');
  const { data, error } = await supabase.from('bioimpedance_exams').select('id').limit(0);
  if (error) {
    console.log('❌ Table still not accessible:', error.message);
    console.log('   You may need to run the SQL manually in the Supabase Dashboard > SQL Editor');
  } else {
    console.log('✅ bioimpedance_exams table is ready!');
  }
}

applyMigration().catch(console.error);
