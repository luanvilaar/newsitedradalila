import { NextRequest, NextResponse } from "next/server";

/**
 * POST: Extract bioimpedance data from PDF
 * Body: FormData with 'file' field containing PDF
 * Returns: Extracted bioimpedance data or template for manual input
 *
 * Note: Uses a JavaScript-based approach instead of Python
 * to avoid system dependencies. Returns template for manual input
 * since full PDF text extraction requires external libraries.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

    // Return template for manual input
    // PDF text extraction in Node.js requires additional dependencies
    // For now, we return a template that allows users to fill in data manually
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
        notes: `PDF importado: ${file.name}`,
      },
      message: `Por favor, preencha os dados de bioimpedância manualmente. O arquivo "${file.name}" foi carregado com sucesso.`,
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      {
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
          notes: "",
        },
        message: "Erro ao processar o PDF. Por favor, preencha os dados manualmente.",
      },
      { status: 200 }
    );
  }
}
