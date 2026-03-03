import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "admin";
}

export async function POST(
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

    // Check authorization: only admin can save bioimpedance
    const admin = await isAdmin(supabase, user.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.weight || !body.measurement_date) {
      return NextResponse.json(
        { error: "Missing required fields: weight and measurement_date" },
        { status: 400 }
      );
    }

    // Prepare bioimpedance record
    const bioimpedanceRecord = {
      patient_id: id,
      recorded_by: user.id,
      weight: parseFloat(body.weight),
      height: body.height ? parseFloat(body.height) : null,
      bmi: body.bmi ? parseFloat(body.bmi) : null,
      body_fat_percentage: body.body_fat_percentage ? parseFloat(body.body_fat_percentage) : null,
      muscle_mass: body.muscle_mass ? parseFloat(body.muscle_mass) : null,
      bone_mass: body.bone_mass ? parseFloat(body.bone_mass) : null,
      visceral_fat: body.visceral_fat ? parseInt(body.visceral_fat) : null,
      water_percentage: body.water_percentage ? parseFloat(body.water_percentage) : null,
      basal_metabolic_rate: body.basal_metabolic_rate ? parseInt(body.basal_metabolic_rate) : null,
      metabolic_age: body.metabolic_age ? parseInt(body.metabolic_age) : null,
      notes: body.notes || null,
      measurement_date: body.measurement_date,
    };

    // Insert into database
    const { data: savedRecord, error } = await supabase
      .from("bioimpedance_records")
      .insert([bioimpedanceRecord])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to save bioimpedance record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: savedRecord,
      message: "Bioimpedância salva com sucesso!",
    }, { status: 201 });
  } catch (error) {
    console.error("Error saving bioimpedance:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}


