// Diagnostic script to inspect patient data for Luan Vilar
const { createClient } = require("@supabase/supabase-js");

const url = process.env.URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SERVICE_ROLE_KEY || process.env.API_KEY;

if (!url || !serviceRole) {
  console.error("Missing env: URL or SERVICE_ROLE_KEY/API_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceRole);

async function run() {
  const email = "l.vilaar@gmail.com";
  const list = await admin.auth.admin.listUsers();
  if (list.error) throw list.error;
  const user = list.data.users.find((u) => u.email === email);
  if (!user) {
    console.log("User not found");
    return;
  }

  const id = user.id;
  console.log("user", id, "confirmed", user.email_confirmed_at);

  const prof = await admin.from("profiles").select("*").eq("id", id).single();
  console.log("profile", prof.data || prof.error);

  const pat = await admin.from("patients").select("*").eq("id", id).single();
  console.log("patient", pat.data || pat.error);

  const bio = await admin
    .from("bioimpedance_records")
    .select("*")
    .eq("patient_id", id)
    .order("measurement_date", { ascending: false })
    .limit(5);
  console.log("bio count", bio.data ? bio.data.length : "err", bio.error || "");
  console.log("bio rows", bio.data || "");

  // Inspect previous duplicate patient (if any) to relocate data
  const oldId = "d7822565-18b6-4d79-87fa-80d6c4d0368e";
  const oldUser = list.data.users.find((u) => u.id === oldId);
  const oldBio = await admin
    .from("bioimpedance_records")
    .select("*")
    .eq("patient_id", oldId)
    .order("measurement_date", { ascending: false })
    .limit(5);
  const ana = await admin.from("anamnesis").select("id").eq("patient_id", oldId);
  const pres = await admin.from("prescriptions").select("id").eq("patient_id", oldId);
  const docs = await admin.from("documents").select("id").eq("patient_id", oldId);
  const serv = await admin.from("services").select("id").eq("patient_id", oldId);
  console.log("oldId bio count", oldBio.data ? oldBio.data.length : "err", oldBio.error || "");
  console.log("oldId bio rows", oldBio.data || "");
  console.log({ oldUser: oldUser?.email, anamnesis: ana.data?.length, prescriptions: pres.data?.length, documents: docs.data?.length, services: serv.data?.length });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});