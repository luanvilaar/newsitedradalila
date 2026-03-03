import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET: Retrieve patient details (patient can only see their own, admin sees all)
 */

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "admin";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

    // Check authorization: patient can only see their own data
    const admin = await isAdmin(supabase, user.id);
    if (!admin && user.id !== id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

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
          avatar_url
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

    const admin = await isAdmin(supabase, user.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { full_name, phone, cpf, birth_date, address, emergency_contact, insurance_info, status, notes } = body;

    // Update profile fields
    if (full_name || phone || cpf || birth_date) {
      const profileUpdate: Record<string, any> = {};
      if (full_name !== undefined) profileUpdate.full_name = full_name;
      if (phone !== undefined) profileUpdate.phone = phone;
      if (cpf !== undefined) profileUpdate.cpf = cpf;
      if (birth_date !== undefined) profileUpdate.birth_date = birth_date;

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", id);

      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 400 }
        );
      }
    }

    // Update patient fields
    const patientUpdate: Record<string, any> = {};
    if (address !== undefined) patientUpdate.address = address;
    if (emergency_contact !== undefined) patientUpdate.emergency_contact = emergency_contact;
    if (insurance_info !== undefined) patientUpdate.insurance_info = insurance_info;
    if (status !== undefined) patientUpdate.status = status;
    if (notes !== undefined) patientUpdate.notes = notes;

    if (Object.keys(patientUpdate).length > 0) {
      const { error: patientError } = await supabase
        .from("patients")
        .update(patientUpdate)
        .eq("id", id);

      if (patientError) {
        return NextResponse.json(
          { error: patientError.message },
          { status: 400 }
        );
      }
    }

    // Return updated patient
    const { data: updated, error: fetchError } = await supabase
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
          avatar_url
        )
      `
      )
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

    const admin = await isAdmin(supabase, user.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    // Soft delete: set status to archived
    const { error } = await supabase
      .from("patients")
      .update({ status: "archived" })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Patient archived" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
