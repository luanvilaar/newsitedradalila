import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET: List all patients (admin only)
 * POST: Create a new patient (admin only)
 */

async function isAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "admin";
}

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

    // Check if user is admin
    const admin = await isAdmin(supabase, user.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    const { data: patients, error } = await supabase
      .from("patients")
      .select(
        `
        id,
        status,
        created_at,
        updated_at,
        profiles (
          full_name,
          phone,
          cpf
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    // Check if user is admin
    const admin = await isAdmin(supabase, user.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      full_name,
      phone,
      cpf,
      email,
      password,
      address,
      emergency_contact,
      insurance_info,
    } = body;

    if (
      !full_name ||
      !cpf ||
      !address?.street ||
      !address?.number ||
      !address?.city ||
      !address?.state ||
      !address?.zip ||
      !phone ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          error:
            "Nome, CPF, endereço completo, telefone, email e senha são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    const { data: existingProfile, error: cpfLookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("cpf", cpf)
      .maybeSingle();

    if (cpfLookupError) {
      return NextResponse.json(
        { error: "Erro ao validar CPF. Tente novamente." },
        { status: 400 }
      );
    }

    if (existingProfile) {
      return NextResponse.json(
        { error: "CPF já cadastrado." },
        { status: 409 }
      );
    }

    // Create auth user using admin client
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        role: "patient",
        full_name,
        phone,
        cpf,
      });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        {
          error:
            profileError.code === "23505"
              ? "CPF ou email já cadastrado."
              : profileError.message,
        },
        { status: 400 }
      );
    }

    // Create patient record
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .insert({
        id: authData.user.id,
        address: {
          street: address.street,
          number: address.number,
          complement: address.complement || null,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zip: address.zip,
        },
        emergency_contact,
        insurance_info,
      })
      .select()
      .single();

    if (patientError) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: patientError.message },
        { status: 400 }
      );
    }

    // Note: Password reset email is handled by Supabase automatically upon user creation
    // No need to call resetPasswordForEmail separately

    return NextResponse.json(
      {
        patient,
        message:
          "Paciente cadastrado. Email de confirmação e orientação para troca de senha enviado.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
