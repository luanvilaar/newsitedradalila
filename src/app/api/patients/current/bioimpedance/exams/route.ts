import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: exams, error } = await supabase
      .from("bioimpedance_exams")
      .select("id, patient_id, pdf_path, parsed_data, parser_status, created_at")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(exams || []);
  } catch (error) {
    console.error("Error fetching current bioimpedance exams:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
