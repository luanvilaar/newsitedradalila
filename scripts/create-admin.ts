import { createClient } from "@supabase/supabase-js";

const email = "dalilalucenaa@gmail.com";
const password = "dali1010";
const fullName = "Dra. Dalila Lucena";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase credentials in environment");
  console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✓" : "✗"}`);
  console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? "✓" : "✗"}`);
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey);

async function createDoctor() {
  try {
    console.log("🔄 Creating doctor account...");
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}`);
    console.log(`👩‍⚕️ Name: ${fullName}\n`);

    // Create auth user
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      throw new Error(`Auth error: ${authError.message}`);
    }

    console.log("✓ Auth user created");

    // Create profile
    const { data: profileData, error: profileError } = await admin
      .from("profiles")
      .insert({
        id: authData.user.id,
        role: "admin",
        full_name: fullName,
      })
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, try to delete the auth user
      await admin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Profile error: ${profileError.message}`);
    }

    console.log("✓ Profile created");

    console.log("\n✅ Doctor account created successfully!");
    console.log(`\nAccount Details:`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Name: ${fullName}`);
    console.log(`  Role: admin`);
    console.log(`  User ID: ${authData.user.id}`);
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

createDoctor();
