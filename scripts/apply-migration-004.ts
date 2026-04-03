/**
 * Applies migration 004_financial_records.sql to Supabase.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Usage: npx tsx scripts/apply-migration-004.ts
 */

import * as fs from "fs";
import * as path from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("❌ Missing environment variables.");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", url ? "✓" : "✗ (missing)");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", serviceKey ? "✓" : "✗ (missing)");
  console.error("\n   Add SUPABASE_SERVICE_ROLE_KEY to .env.local and retry.");
  console.error("   Find it at: https://supabase.com/dashboard/project/jcvjaiufrbqclcxproee/settings/api");
  process.exit(1);
}

const sqlPath = path.resolve("supabase/migrations/004_financial_records.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

async function run() {
  console.log("⏳ Applying migration 004_financial_records.sql...");

  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey!,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    // Fallback: try via pg REST endpoint
    const res2 = await fetch(`${url}/pg/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey!,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!res2.ok) {
      const text = await res2.text();
      console.error("❌ Migration failed:", text);
      console.log("\n📋 Manual option:");
      console.log("   1. Open: https://supabase.com/dashboard/project/jcvjaiufrbqclcxproee/sql/new");
      console.log("   2. Paste the contents of: supabase/migrations/004_financial_records.sql");
      console.log("   3. Click Run");
      process.exit(1);
    }
  }

  console.log("✅ Migration applied successfully!");
  console.log("   Table financial_records created with RLS policies.");
}

run().catch((e) => {
  console.error("❌ Error:", e.message);
  console.log("\n📋 Manual option:");
  console.log("   1. Open: https://supabase.com/dashboard/project/jcvjaiufrbqclcxproee/sql/new");
  console.log("   2. Paste the contents of: supabase/migrations/004_financial_records.sql");
  console.log("   3. Click Run");
});
