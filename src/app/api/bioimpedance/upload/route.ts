import { createAdminClient, createClient } from "@/lib/supabase/server";
import { hasValidPdfSignature, parseBioimpedanceText } from "@/lib/bioimpedance/pdf-parser";
import { analyzeBioimpedancePdf, isGeminiConfigured } from "@/lib/bioimpedance/gemini-pdf-analyzer";
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const patientId = String(formData.get("patientId") || "").trim();
    const keepHistory = String(formData.get("keepHistory") || "true") === "true";

    if (!patientId || !file) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes: file e patientId" },
        { status: 400 }
      );
    }

    const admin = await isAdmin(supabase, user.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    const isPdfMime =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdfMime) {
      return NextResponse.json(
        { error: "Arquivo inválido. Apenas PDF é permitido." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Limite máximo: 10MB." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (!hasValidPdfSignature(bytes)) {
      return NextResponse.json(
        { error: "Arquivo inválido: assinatura de PDF não reconhecida." },
        { status: 400 }
      );
    }

    // Always use admin client for storage operations (anon key lacks permissions)
    let adminClient: ReturnType<typeof createAdminClient>;
    try {
      adminClient = createAdminClient();
    } catch (err) {
      console.error("[bioimpedance/upload] SUPABASE_SERVICE_ROLE_KEY not set", err);
      return NextResponse.json(
        { error: "Configuração do servidor incompleta (service role key ausente)." },
        { status: 500 }
      );
    }

    const bucketName = "patient-documents";

    // Ensure the bucket exists — create it if missing
    const { data: buckets } = await adminClient.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucketName);

    if (!bucketExists) {
      const { error: createBucketError } = await adminClient.storage.createBucket(
        bucketName,
        {
          public: false,
          fileSizeLimit: 10 * 1024 * 1024,
          allowedMimeTypes: ["application/pdf"],
        }
      );

      if (createBucketError && !createBucketError.message.toLowerCase().includes("already exists")) {
        console.error("[bioimpedance/upload] create bucket error", createBucketError);
        return NextResponse.json(
          {
            error: "Não foi possível criar o bucket de armazenamento.",
            details: createBucketError.message,
          },
          { status: 500 }
        );
      }
      console.log("[bioimpedance/upload] bucket created:", bucketName);
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const pdfPath = `${patientId}/bioimpedance/${timestamp}_${safeName}`;

    const { error: uploadError } = await adminClient.storage
      .from(bucketName)
      .upload(pdfPath, bytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("[bioimpedance/upload] storage upload error", uploadError);
      return NextResponse.json(
        {
          error: "Falha ao salvar PDF no storage.",
          details: uploadError.message,
        },
        { status: 500 }
      );
    }

    let extractedText = "";
    let parserError: string | null = null;

    try {
      const { PDFParse } = await import("pdf-parse");
      const pdfParser = new PDFParse({ data: Buffer.from(buffer) });
      const parsed = await pdfParser.getText();
      extractedText = parsed?.text || "";
    } catch (error) {
      parserError = error instanceof Error ? error.message : "Erro ao ler PDF";
      console.error("[bioimpedance/upload] parser error", error);
    }

    const parsed = parseBioimpedanceText(extractedText);
    const hasParsedValues = parsed.extractedFields.length > 0;

    const { data: exam, error: examError } = await supabase
      .from("bioimpedance_exams")
      .insert({
        patient_id: patientId,
        uploaded_by: user.id,
        pdf_path: pdfPath,
        parsed_data: parsed.data,
        parser_status: parserError ? "failed" : hasParsedValues ? "success" : "empty",
        parser_error: parserError,
      })
      .select("id, patient_id, pdf_path, parsed_data, parser_status, parser_error, created_at")
      .single();

    if (examError || !exam) {
      console.error("[bioimpedance/upload] exam insert error", examError);
      await adminClient.storage.from(bucketName).remove([pdfPath]);
      return NextResponse.json(
        { error: "Falha ao salvar metadados do exame." },
        { status: 500 }
      );
    }

    if (!keepHistory) {
      const { data: oldExams } = await supabase
        .from("bioimpedance_exams")
        .select("id, pdf_path")
        .eq("patient_id", patientId)
        .neq("id", exam.id)
        .order("created_at", { ascending: false });

      if (oldExams?.length) {
        const oldPaths = oldExams.map((item) => item.pdf_path).filter(Boolean);
        if (oldPaths.length) {
          await adminClient.storage.from(bucketName).remove(oldPaths);
        }
        const oldIds = oldExams.map((item) => item.id);
        if (oldIds.length) {
          await supabase.from("bioimpedance_exams").delete().in("id", oldIds);
        }
      }
    }

    const { data: signedData, error: signedError } = await adminClient.storage
      .from(bucketName)
      .createSignedUrl(pdfPath, 60 * 60);

    if (signedError) {
      console.error("[bioimpedance/upload] signed url error", signedError);
    }

    // ── AI Analysis (non-blocking, best-effort) ─────────────────────
    let aiAnalysis = null;
    if (isGeminiConfigured()) {
      try {
        aiAnalysis = await analyzeBioimpedancePdf(buffer, {
          includeRecommendations: true,
        });

        // Merge AI-extracted data with regex-parsed data (AI takes priority)
        if (aiAnalysis.confidence > 0.5) {
          const aiData = aiAnalysis.extractedData;
          const mergedParsedData = {
            ...(exam.parsed_data as Record<string, unknown> || {}),
            ...(aiData.weight != null && { weight: aiData.weight }),
            ...(aiData.bmi != null && { bmi: aiData.bmi }),
            ...(aiData.body_fat_percentage != null && { body_fat_percentage: aiData.body_fat_percentage }),
            ...(aiData.muscle_mass != null && { muscle_mass: aiData.muscle_mass }),
            ...(aiData.bone_mass != null && { bone_mass: aiData.bone_mass }),
            ...(aiData.visceral_fat != null && { visceral_fat: aiData.visceral_fat }),
            ...(aiData.water_percentage != null && { water_percentage: aiData.water_percentage }),
            ...(aiData.basal_metabolic_rate != null && { basal_metabolic_rate: aiData.basal_metabolic_rate }),
            ai_analysis: aiAnalysis,
            ai_analyzed_at: new Date().toISOString(),
          };

          await supabase
            .from("bioimpedance_exams")
            .update({ parsed_data: mergedParsedData, parser_status: "success" })
            .eq("id", exam.id);
        }
      } catch (aiError) {
        console.error("[bioimpedance/upload] AI analysis failed (non-blocking):", aiError);
      }
    }

    return NextResponse.json(
      {
        success: hasParsedValues || (aiAnalysis?.confidence ?? 0) > 0.5,
        data: {
          ...parsed.data,
          ...(aiAnalysis?.extractedData || {}),
          notes: hasParsedValues
            ? `PDF importado: ${file.name}. Campos extraídos: ${parsed.extractedFields.join(", ") || "nenhum"}.`
            : `PDF importado: ${file.name}. Não foi possível extrair campos automaticamente.`,
        },
        extractedFields: aiAnalysis?.fieldsExtracted?.length
          ? aiAnalysis.fieldsExtracted
          : parsed.extractedFields,
        aiAnalysis: aiAnalysis || null,
        exam: {
          ...exam,
          pdf_url: signedData?.signedUrl ?? null,
        },
        message: aiAnalysis
          ? `IA analisou o PDF com ${Math.round(aiAnalysis.confidence * 100)}% de confiança (${aiAnalysis.fieldsExtracted.length} campos).`
          : parserError
            ? "PDF salvo com sucesso, mas houve falha ao processar automaticamente."
            : hasParsedValues
              ? `Dados extraídos com sucesso (${parsed.extractedFields.length} campo(s)).`
              : "PDF salvo, mas sem campos detectáveis. Preencha manualmente.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[bioimpedance/upload] unexpected error", error);
    return NextResponse.json(
      {
        error: "Erro interno ao importar bioimpedância.",
      },
      { status: 500 }
    );
  }
}
