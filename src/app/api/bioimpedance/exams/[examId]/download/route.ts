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
  { params }: { params: Promise<{ examId: string }> }
) {
  const { examId } = await params;

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: exam, error: examError } = await supabase
      .from("bioimpedance_exams")
      .select("id, patient_id, pdf_path")
      .eq("id", examId)
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: "Exame não encontrado" }, { status: 404 });
    }

    const admin = await isAdmin(supabase, user.id);
    if (!admin && exam.patient_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase.storage
      .from("patient-documents")
      .createSignedUrl(exam.pdf_path, 60 * 10);

    if (error || !data?.signedUrl) {
      console.error("[bioimpedance/download] signed url error", error);
      return NextResponse.json(
        { error: "Falha ao gerar link de download" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      exam_id: exam.id,
      url: data.signedUrl,
      expires_in_seconds: 600,
    });
  } catch (error) {
    console.error("[bioimpedance/download] unexpected error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
