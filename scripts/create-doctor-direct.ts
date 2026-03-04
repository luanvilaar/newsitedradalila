import { createClient } from "@supabase/supabase-js";

const email = "dalilalucenaa@gmail.com";
const password = "dali1010";
const fullName = "Dra. Dalila Lucena";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjdmphaXVmcmJxY2xjeHByb2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTg2MDIsImV4cCI6MjA4ODA3NDYwMn0.ynvbm4Kav8uPRsEHIOBx7eqD-zQ926v6J01mt0ViHlUNEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function createDoctor() {
  try {
    console.log("🔄 Creating doctor account...");
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}`);
    console.log(`👩‍⚕️ Name: ${fullName}\n`);

    // Step 1: Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      throw new Error(`Sign up error: ${signUpError.message}`);
    }

    if (!authData.user?.id) {
      throw new Error("Failed to create user account");
    }

    console.log("✓ User account created");

    // Step 2: Wait for the user to be created in the database
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 3: Create admin profile manually
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        role: "admin",
        full_name: fullName,
      })
      .select()
      .single();

    if (profileError) {
      console.warn("Profile creation warning:", profileError.message);
      // Continue anyway - profile might already exist
    } else {
      console.log("✓ Admin profile created");
    }

    console.log("\n✅ Doctor account created successfully!");
    console.log(`\nAccount Details:`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Name: ${fullName}`);
    console.log(`  Role: admin`);
    console.log(`  User ID: ${authData.user.id}`);
    console.log(`\n📝 You can now login with these credentials!`);
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

createDoctor();
