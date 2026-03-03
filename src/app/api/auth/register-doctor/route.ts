import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * POST: Create a new doctor/admin account
 * Requires either:
 * 1. SUPABASE_SERVICE_ROLE_KEY in environment, OR
 * 2. DOCTOR_CREATION_TOKEN in header matching DOCTOR_CREATION_SECRET
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Try Service Role Key first
    let adminClient = null;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceRoleKey) {
      // Method 1: Use Service Role Key (Recommended)
      adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      );
    } else {
      // Method 2: Use temporary creation token
      const creationToken = request.headers.get("X-Doctor-Creation-Token");
      const creationSecret = process.env.DOCTOR_CREATION_SECRET;

      if (!creationToken || !creationSecret || creationToken !== creationSecret) {
        return NextResponse.json(
          {
            error:
              "Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local or use X-Doctor-Creation-Token header",
            hint: "Generate a token: npx -y crypto@latest randomBytes(32).toString('hex')",
          },
          { status: 500 }
        );
      }

      // Use anon key but with temp token validation
      const { createClient } = await import("@/lib/supabase/client");
      const tempClient = createClient();

      // Try signup + profile creation with anon client
      try {
        const { data: authData, error: authError } =
          await tempClient.auth.signUp({
            email,
            password,
          });

        if (authError) {
          return NextResponse.json(
            { error: authError.message },
            { status: 400 }
          );
        }

        if (!authData.user?.id) {
          return NextResponse.json(
            { error: "Failed to create user" },
            { status: 400 }
          );
        }

        // Wait a moment for the user to be created
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Try to create profile immediately after signup
        const { data: profileData, error: profileError } = await tempClient
          .from("profiles")
          .insert({
            id: authData.user.id,
            role: "admin",
            full_name: full_name || email.split("@")[0],
          })
          .select()
          .single();

        if (profileError?.code === "PGRST301") {
          // Row already exists
          return NextResponse.json({
            message: "Doctor account created successfully (existing profile)",
            user: {
              id: authData.user.id,
              email: authData.user.email,
            },
          });
        }

        if (profileError) {
          console.error("Profile creation error:", profileError);
          return NextResponse.json({
            message:
              "Account created but profile setup may be incomplete. Try logging in or contact support.",
            user: {
              id: authData.user.id,
              email: authData.user.email,
            },
            error: profileError.message,
          });
        }

        return NextResponse.json({
          message: "Doctor account created successfully",
          user: {
            id: authData.user.id,
            email: authData.user.email,
          },
          profile: profileData,
        });
      } catch (tempError) {
        console.error("Error with anon client:", tempError);
        return NextResponse.json(
          { error: "Failed to create account with current configuration" },
          { status: 500 }
        );
      }
    }

    // If we have admin client, use it
    if (adminClient) {
      const { data: authData, error: authError } =
        await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (authError) {
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        );
      }

      const { data: profileData, error: profileError } = await adminClient
        .from("profiles")
        .insert({
          id: authData.user.id,
          role: "admin",
          full_name: full_name || email.split("@")[0],
        })
        .select()
        .single();

      if (profileError) {
        await adminClient.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json(
          { error: `Failed to create profile: ${profileError.message}` },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: "Doctor account created successfully",
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        profile: profileData,
      });
    }
  } catch (error) {
    console.error("Error creating doctor account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
