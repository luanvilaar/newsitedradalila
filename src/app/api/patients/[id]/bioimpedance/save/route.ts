import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

    const patientSnapshot = {
      weight: bioimpedanceRecord.weight,
      height: bioimpedanceRecord.height,
      bmi: bioimpedanceRecord.bmi,
      body_fat_percentage: bioimpedanceRecord.body_fat_percentage,
      muscle_mass: bioimpedanceRecord.muscle_mass,
      bone_mass: bioimpedanceRecord.bone_mass,
      visceral_fat: bioimpedanceRecord.visceral_fat,
      water_percentage: bioimpedanceRecord.water_percentage,
      basal_metabolic_rate: bioimpedanceRecord.basal_metabolic_rate,
      metabolic_age: bioimpedanceRecord.metabolic_age,
      bioimpedance_updated_at: new Date().toISOString(),
    };

    const { error: patientUpdateError } = await supabase
      .from("patients")
      .update(patientSnapshot)
      .eq("id", id);

    if (patientUpdateError) {
      console.error("Patient snapshot update error:", patientUpdateError);
    }

    if (body.exam_id) {
      const { error: examUpdateError } = await supabase
        .from("bioimpedance_exams")
        .update({
          bioimpedance_record_id: savedRecord.id,
          parsed_data: {
            weight: savedRecord.weight,
            height: savedRecord.height,
            bmi: savedRecord.bmi,
            body_fat_percentage: savedRecord.body_fat_percentage,
            muscle_mass: savedRecord.muscle_mass,
            bone_mass: savedRecord.bone_mass,
            visceral_fat: savedRecord.visceral_fat,
            water_percentage: savedRecord.water_percentage,
            basal_metabolic_rate: savedRecord.basal_metabolic_rate,
            metabolic_age: savedRecord.metabolic_age,
            measurement_date: savedRecord.measurement_date,
          },
        })
        .eq("id", body.exam_id)
        .eq("patient_id", id);

      if (examUpdateError) {
        console.error("Exam update error:", examUpdateError);
      }
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


