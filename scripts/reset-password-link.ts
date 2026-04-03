import { createClient } from "@supabase/supabase-js";

const email = "dalilalucenaa@gmail.com";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function resetPassword() {
  try {
    console.log("🔄 Requesting password reset link...");
    console.log(`📧 Email: ${email}\n`);

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/auth/callback",
    });

    if (error) {
      throw new Error(`Error: ${error.message}`);
    }

    console.log("✅ Password reset link sent!");
    console.log(`\n📧 Check your email at: ${email}`);
    console.log(`\n📝 Follow the link to set a new password.`);
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

resetPassword();
