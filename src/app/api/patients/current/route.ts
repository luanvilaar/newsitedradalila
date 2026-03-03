import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET: Retrieve current logged-in patient's details
 */

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get patient data
    const { data: patient, error } = await supabase
      .from("patients")
      .select(
        `
        id,
        address,
        emergency_contact,
        insurance_info,
        status,
        notes,
        created_at,
        updated_at,
        profiles (
          full_name,
          phone,
          cpf,
          birth_date,
          avatar_url,
          role
        )
      `
      )
      .eq("id", user.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error fetching current patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
