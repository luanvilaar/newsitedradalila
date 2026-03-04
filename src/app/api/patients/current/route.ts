import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET: Retrieve current logged-in patient's details
 * Auto-creates patients entry if missing
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
    let { data: patient, error } = await supabase
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

    // If no patient entry exists, create one automatically
    if (error?.code === "PGRST116") {
      const { error: insertError } = await supabase
        .from("patients")
        .insert({ id: user.id, status: "active" });

      if (insertError) {
        console.error("Failed to auto-create patient entry:", insertError);
        // Return profile data only as fallback
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone, cpf, birth_date, avatar_url, role")
          .eq("id", user.id)
          .single();

        return NextResponse.json({
          id: user.id,
          status: "active",
          profiles: profile,
        });
      }

      // Retry fetch after creation
      const { data: newPatient, error: retryError } = await supabase
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

      if (retryError) {
        return NextResponse.json(
          { error: retryError.message },
          { status: 400 }
        );
      }

      return NextResponse.json(newPatient);
    }

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
