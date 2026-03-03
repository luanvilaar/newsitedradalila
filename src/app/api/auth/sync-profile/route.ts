import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST: Sync user profile - creates if doesn't exist
 * Useful for fixing missing profiles after signup
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    // Profile already exists
    if (existingProfile) {
      return NextResponse.json({
        message: "Profile already exists",
        profile: existingProfile,
      });
    }

    // Profile doesn't exist, create it
    if (checkError?.code === "PGRST116") {
      // No rows returned - create profile
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          role: "patient", // Default to patient
          full_name: user.email?.split("@")[0] || "User",
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: `Failed to create profile: ${createError.message}` },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: "Profile created successfully",
        profile: newProfile,
      });
    }

    // Some other error occurred
    if (checkError) {
      return NextResponse.json(
        {
          error: `Error checking profile: ${checkError.message}`,
          code: checkError.code,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Sync profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
