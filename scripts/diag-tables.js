const { createClient } = require('@supabase/supabase-js');

const url = 'https://jcvjaiufrbqclcxproee.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjdmphaXVmcmJxY2xjeHByb2VlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5ODYwMiwiZXhwIjoyMDg4MDc0NjAyfQ._FVTBWDshPwJjMoVa7MXB8Dc1ocF-MaLP28rV75dehI';

const supabase = createClient(url, serviceKey);

async function check() {
  // Check bioimpedance_records
  const { data: r1, error: e1 } = await supabase.from('bioimpedance_records').select('id').limit(1);
  console.log('bioimpedance_records:', r1 ? 'EXISTS' : 'MISSING', e1?.message || '');

  // Check patients columns
  const { data: r2, error: e2 } = await supabase.from('patients').select('id, full_name').limit(1);
  console.log('patients select:', r2, e2?.message || '');

  // Check all tables available
  const tables = ['patients', 'profiles', 'bioimpedance_records', 'bioimpedance_exams', 'appointments'];
  for (const t of tables) {
    const { error } = await supabase.from(t).select('id').limit(0);
    console.log(`table ${t}: ${error ? 'MISSING — ' + error.message : 'EXISTS'}`);
  }
}
check().catch(console.error);
