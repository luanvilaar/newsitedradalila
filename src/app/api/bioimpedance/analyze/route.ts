import { createAdminClient, createClient } from "@/lib/supabase/server";
import { analyzeBioimpedancePdf, isGeminiConfigured } from "@/lib/bioimpedance/gemini-pdf-analyzer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Gemini is available
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "IA não configurada. Configure GOOGLE_GEMINI_API_KEY no .env.local." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { examId, patientContext } = body;

    if (!examId) {
      return NextResponse.json(
        { error: "examId é obrigatório" },
        { status: 400 }
      );
    }

    // Fetch exam record
    const { data: exam, error: examError } = await supabase
      .from("bioimpedance_exams")
      .select("id, patient_id, pdf_path, parsed_data, parser_status")
      .eq("id", examId)
      .single();

    if (examError || !exam) {
      return NextResponse.json(
        { error: "Exame não encontrado" },
        { status: 404 }
      );
    }

    // Download the PDF from storage
    let adminClient: ReturnType<typeof createAdminClient>;
    try {
      adminClient = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: "Configuração do servidor incompleta" },
        { status: 500 }
      );
    }

    const { data: fileData, error: downloadError } = await adminClient.storage
      .from("patient-documents")
      .download(exam.pdf_path);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: "Não foi possível baixar o PDF do exame" },
        { status: 500 }
      );
    }

    const pdfBuffer = await fileData.arrayBuffer();

    // Analyze with Gemini AI
    const analysis = await analyzeBioimpedancePdf(pdfBuffer, {
      includeRecommendations: true,
      patientContext: patientContext || undefined,
    });

    // Save AI analysis result alongside exam
    await supabase
      .from("bioimpedance_exams")
      .update({
        parsed_data: {
          ...((exam.parsed_data as Record<string, unknown>) || {}),
          ai_analysis: analysis,
          ai_analyzed_at: new Date().toISOString(),
        },
      })
      .eq("id", examId);

    return NextResponse.json({
      success: true,
      analysis,
      message: `IA analisou o exame com ${Math.round(analysis.confidence * 100)}% de confiança.`,
    });
  } catch (error) {
    console.error("[bioimpedance/analyze] error:", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
