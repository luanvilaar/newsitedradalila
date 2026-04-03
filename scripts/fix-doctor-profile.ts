import { createClient } from "@supabase/supabase-js";

const email = "dalilalucenaa@gmail.com";
const userId = "dad7b663-3013-4f5a-a493-253d3c2e6030";
const fullName = "Dra. Dalila Lucena";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function fixProfile() {
  try {
    console.log("🔄 Fixing doctor profile...");
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 User ID: ${userId}\n`);

    // Step 1: Delete existing profile if it exists
    console.log("Attempting to delete existing profile...");
    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (deleteError && deleteError.code !== "PGRST116") {
      console.warn("Delete warning:", deleteError.message);
    } else {
      console.log("✓ Old profile removed (if existed)");
    }

    // Step 2: Create new profile with correct role
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { data: profileData, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        role: "admin",
        full_name: fullName,
        email: email,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to create profile: ${insertError.message}`);
    }

    console.log("✓ New admin profile created");

    console.log("\n✅ Profile fixed successfully!");
    console.log(`\nProfile Details:`);
    console.log(`  User ID: ${userId}`);
    console.log(`  Email: ${email}`);
    console.log(`  Name: ${fullName}`);
    console.log(`  Role: admin`);
    console.log(`\n🔄 Try logging in again!`);
  } catch (error) {
    console.error(
      "\n❌ Error:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

fixProfile();
