const fs = require('fs');
const path = require('path');

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjdmphaXVmcmJxY2xjeHByb2VlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5ODYwMiwiZXhwIjoyMDg4MDc0NjAyfQ._FVTBWDshPwJjMoVa7MXB8Dc1ocF-MaLP28rV75dehI';

const SQL = fs.readFileSync(
  path.join(__dirname, '..', 'supabase', 'migrations', '005_bioimpedance_exams.sql'),
  'utf8'
) + "\nNOTIFY pgrst, 'reload schema';";

async function run() {
  console.log('Sending migration SQL to Supabase...');
  const res = await fetch('https://jcvjaiufrbqclcxproee.supabase.co/pg/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'x-supabase-api-version': '2024-01-01',
    },
    body: JSON.stringify({ query: SQL }),
  });

  const status = res.status;
  const body = await res.text();
  console.log('HTTP', status);
  console.log(body.substring(0, 1000));

  if (status >= 200 && status < 300) {
    console.log('\n✅ Migration applied successfully!');
  } else {
    console.log('\n❌ Migration failed. Status:', status);
  }

  // Verify table exists
  console.log('\nVerifying table...');
  await new Promise(r => setTimeout(r, 2000));
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient('https://jcvjaiufrbqclcxproee.supabase.co', SERVICE_KEY);
  const { data, error } = await supabase.from('bioimpedance_exams').select('id').limit(0);
  if (error) {
    console.log('❌ Table not accessible yet:', error.message);
  } else {
    console.log('✅ bioimpedance_exams table accessible!');
  }
}

run().catch(console.error);
