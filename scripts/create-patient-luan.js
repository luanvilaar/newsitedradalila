// Utility script to create the patient user/profile/patient rows.
// Usage: SERVICE_ROLE_KEY=... URL=... node scripts/create-patient-luan.js
const { createClient } = require("@supabase/supabase-js");

const url = process.env.URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SERVICE_ROLE_KEY || process.env.API_KEY;

if (!url || !serviceRole) {
  console.error("Missing URL or service role key in env (URL / SERVICE_ROLE_KEY)");
  process.exit(1);
}

const supabase = createClient(url, serviceRole);

async function run() {
  const email = "l.vilaar@gmail.com";
  const password = "luan1234";
  const full_name = "Luan Vilar";

  // Try to find existing user first
  const listRes = await supabase.auth.admin.listUsers();
  if (listRes.error) throw listRes.error;
  const existing = listRes.data.users.find((u) => u.email === email);

  let userId = existing?.id;

  if (existing) {
    console.log("User already exists, updating password...");
    const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
    });
    if (updateErr) throw updateErr;
  } else {
    console.log("Creating auth user...");
    const { data: userData, error: userErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (userErr) throw userErr;
    userId = userData.user.id;
  }

  console.log("User id", userId);

  console.log("Upserting profile...");
  const { error: profileErr } = await supabase.from("profiles").upsert({
    id: userId,
    role: "patient",
    full_name,
  });
  if (profileErr) throw profileErr;

  console.log("Upserting patient record...");
  const { error: patientErr } = await supabase.from("patients").upsert({
    id: userId,
    status: "active",
  });
  if (patientErr) throw patientErr;

  console.log("✅ Patient created/updated successfully");
}

run().catch((e) => {
  console.error("❌ Failed:", e.message || e);
  process.exit(1);
});