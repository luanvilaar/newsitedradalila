// Apply migration using Supabase's own SQL execution capability
// This uses the /sql endpoint available on newer Supabase versions
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'jcvjaiufrbqclcxproee';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjdmphaXVmcmJxY2xjeHByb2VlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5ODYwMiwiZXhwIjoyMDg4MDc0NjAyfQ._FVTBWDshPwJjMoVa7MXB8Dc1ocF-MaLP28rV75dehI';

const sql = fs.readFileSync(
  path.join(__dirname, '..', 'supabase', 'migrations', '005_bioimpedance_exams.sql'),
  'utf8'
);

const endpoints = [
  // Different Supabase endpoint variations
  `https://${PROJECT_REF}.supabase.co/pg/query`,
  `https://${PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql`,
  `https://${PROJECT_REF}.supabase.co/pg-meta/default/query`,
];

async function tryEndpoint(url, body, headers) {
  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    return { url, status: res.status, body: await res.text() };
  } catch (e) {
    return { url, status: 0, body: e.message };
  }
}

async function run() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'apikey': SERVICE_KEY,
    'x-supabase-api-version': '2024-01-01',
  };

  console.log('Trying various Supabase SQL endpoints...\n');

  for (const url of endpoints) {
    const r = await tryEndpoint(url, { query: sql }, headers);
    console.log(`${url}`);
    console.log(`  Status: ${r.status}`);
    console.log(`  Body: ${r.body.substring(0, 200)}`);
    console.log();

    if (r.status >= 200 && r.status < 300) {
      console.log('✅ Success with endpoint:', url);
      return;
    }
  }

  // Fallback: try connecting with pg directly (session mode)
  console.log('All REST endpoints failed. Trying direct pg connection...');

  const { Client } = require('pg');
  
  // Try multiple connection approaches
  const connectionStrings = [
    // Transaction pooler (port 6543)
    `postgresql://postgres.${PROJECT_REF}:${SERVICE_KEY}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`,
    // Session pooler (port 5432)
    `postgresql://postgres.${PROJECT_REF}:${SERVICE_KEY}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`,
    // Direct connection
    `postgresql://postgres:${SERVICE_KEY}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
  ];

  for (const connStr of connectionStrings) {
    const sanitized = connStr.replace(SERVICE_KEY, '***');
    console.log(`\nTrying: ${sanitized}`);
    
    const client = new Client({ 
      connectionString: connStr, 
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    try {
      await client.connect();
      console.log('  Connected!');
      await client.query(sql);
      console.log('  ✅ Migration applied!');
      
      await client.query("NOTIFY pgrst, 'reload schema'");
      console.log('  ✅ Schema reload notified');

      const check = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename='bioimpedance_exams'");
      console.log(`  Table exists: ${check.rows.length > 0}`);
      
      await client.end();
      return;
    } catch (e) {
      console.log(`  ❌ Failed: ${e.message}`);
      try { await client.end(); } catch {}
    }
  }

  console.log('\n\n========================================');
  console.log('Não consegui aplicar automaticamente.');
  console.log('Por favor, copie e cole o SQL abaixo no Supabase SQL Editor:');
  console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
  console.log('========================================\n');
  console.log(sql);
}

run().catch(console.error);
