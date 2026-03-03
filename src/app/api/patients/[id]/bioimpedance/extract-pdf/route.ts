import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { tmpdir } from "os";

/**
 * POST: Extract bioimpedance data from PDF
 * Body: FormData with 'file' field containing PDF
 * Returns: Extracted bioimpedance data
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tempFilePath = join(tmpdir(), `bioimpedance-${Date.now()}.pdf`);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Write PDF to temporary file
    const bytes = await file.arrayBuffer();
    writeFileSync(tempFilePath, Buffer.from(bytes));

    // Call Python script to extract data
    const pythonScriptPath = join(process.cwd(), "scripts", "extract_bioimpedance_pdf.py");

    if (!existsSync(pythonScriptPath)) {
      return NextResponse.json(
        { error: "PDF extraction service unavailable" },
        { status: 500 }
      );
    }

    try {
      const output = execSync(`python3 "${pythonScriptPath}" "${tempFilePath}" --output json`, {
        encoding: "utf-8",
        timeout: 30000, // 30 seconds timeout
      });

      const extractedData = JSON.parse(output);

      // Ensure measurement_date is set
      if (!extractedData.measurement_date) {
        extractedData.measurement_date = new Date().toISOString().split("T")[0];
      }

      return NextResponse.json({
        success: true,
        data: extractedData,
        message: "Dados extraídos com sucesso! Revise e confirme.",
      });
    } catch (execError: any) {
      console.error("Python script error:", execError.message);

      // If Python script fails, return a template for manual input
      return NextResponse.json({
        success: false,
        data: {
          weight: null,
          height: null,
          body_fat_percentage: null,
          muscle_mass: null,
          bone_mass: null,
          visceral_fat: null,
          water_percentage: null,
          basal_metabolic_rate: null,
          metabolic_age: null,
          measurement_date: new Date().toISOString().split("T")[0],
          notes: `PDF importado: ${file.name} (não foi possível extrair automaticamente, preencha manualmente)`,
        },
        message: `Erro ao extrair dados do PDF. Preencha os dados manualmente. Erro: ${execError.message.substring(0, 100)}`,
      });
    }
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  } finally {
    // Clean up temporary file
    try {
      if (existsSync(tempFilePath)) {
        unlinkSync(tempFilePath);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up temp file:", cleanupError);
    }
  }
}
