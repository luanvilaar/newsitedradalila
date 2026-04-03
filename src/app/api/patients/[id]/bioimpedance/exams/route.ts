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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdmin(supabase, user.id);
    if (!admin && user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: exams, error } = await supabase
      .from("bioimpedance_exams")
      .select("id, patient_id, pdf_path, parsed_data, parser_status, created_at")
      .eq("patient_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(exams || []);
  } catch (error) {
    console.error("Error fetching patient bioimpedance exams:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
