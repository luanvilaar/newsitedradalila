// Apply migration 005 via direct PostgreSQL connection
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase Postgres connection string
// Format: postgresql://postgres.[project-ref]:[password]@[host]:5432/postgres
const connectionString = 'postgresql://postgres.jcvjaiufrbqclcxproee:Luan13052003@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');

    const sql = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '005_bioimpedance_exams.sql'),
      'utf8'
    );

    console.log('Executing migration 005...');
    await client.query(sql);
    console.log('✅ Migration applied successfully!\n');

    // Verify
    const res = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename='bioimpedance_exams'");
    if (res.rows.length > 0) {
      console.log('✅ Table bioimpedance_exams exists!');
    } else {
      console.log('❌ Table bioimpedance_exams NOT found');
    }

    // Notify PostgREST to reload
    await client.query("NOTIFY pgrst, 'reload schema'");
    console.log('✅ Schema cache reload notified');

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('password')) {
      console.log('\nYou need to set the correct database password.');
      console.log('Find it at: https://supabase.com/dashboard/project/jcvjaiufrbqclcxproee/settings/database');
    }
  } finally {
    await client.end();
  }
}

run();
