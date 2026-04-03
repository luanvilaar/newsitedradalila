import { createClient } from "@supabase/supabase-js";

const email = "dalilalucenaa@gmail.com";
const newPassword = "dali1010";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase credentials in environment");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey);

async function updatePassword() {
  try {
    console.log("🔄 Updating password...");
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 New Password: ${newPassword}\n`);

    // First, get the user by email
    const { data: users, error: fetchError } = await admin.auth.admin.listUsers();

    if (fetchError) {
      throw new Error(`Error listing users: ${fetchError.message}`);
    }

    const user = users?.users?.find((u) => u.email === email);

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    console.log(`✓ User found: ${user.id}`);

    // Update the user's password
    const { data: updatedUser, error: updateError } =
      await admin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

    if (updateError) {
      throw new Error(`Password update error: ${updateError.message}`);
    }

    console.log("✓ Password updated");

    console.log("\n✅ Password updated successfully!");
    console.log(`\nAccount Details:`);
    console.log(`  Email: ${email}`);
    console.log(`  New Password: ${newPassword}`);
    console.log(`  User ID: ${user.id}`);
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

updatePassword();
