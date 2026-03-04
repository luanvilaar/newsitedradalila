import { NextRequest, NextResponse } from "next/server";

/**
 * POST: Extract bioimpedance data from PDF
 * Supports InBody120 format and standard labeled formats.
 */

function toNumber(value?: string | null): number | null {
  if (!value) return null;
  const normalized = value.replace(/\./g, "").replace(/,/g, ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractField(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

// ── InBody120 parser ──────────────────────────────────────────────────────────
function isInBody120(text: string): boolean {
  return /inbody/i.test(text);
}

function parseInBody120(text: string) {
  // Height: "167cm"
  const heightMatch = text.match(/\b(\d{2,3})\s*cm\b/i);
  const height = heightMatch ? Number(heightMatch[1]) : null;

  // Measurement date: first DD.MM.YYYY in text → ISO YYYY-MM-DD
  const dateMatch = text.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  const measurementDate = dateMatch
    ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`
    : new Date().toISOString().split("T")[0];

  // Total Body Water (L) from composition table: "(L)  32,9"
  const tbwMatch = text.match(/\(L\)\s+([\d,]+)/);
  const tbw = tbwMatch ? parseFloat(tbwMatch[1].replace(",", ".")) : null;

  // Composition table (kg) rows in order: Protein, Minerals/Bone, BFM, Weight
  const kgTablePattern = /\(kg\)\s+([\d,]+)/g;
  const kgValues: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = kgTablePattern.exec(text)) !== null) {
    const v = parseFloat(m[1].replace(",", "."));
    if (!isNaN(v) && v > 0) kgValues.push(v);
  }

  // Weight = largest value (>= 40 kg)
  const heavyCandidates = kgValues.filter((v) => v >= 40);
  const weight =
    heavyCandidates.length > 0 ? Math.max(...heavyCandidates) : null;

  // Bone mass = value in 2–6 kg range (mineral mass)
  const boneMass = kgValues.find((v) => v >= 2 && v <= 6) ?? null;

  // Body Fat Mass (BFM): value between bone and weight (> 6 kg, < 60% of weight)
  const bfmCandidates = kgValues.filter(
    (v) => v > 6 && weight !== null && v < weight * 0.7
  );
  const bfm = bfmCandidates.length > 0 ? Math.max(...bfmCandidates) : null;

  // Derived
  const bodyFatPct =
    bfm && weight
      ? parseFloat(((bfm / weight) * 100).toFixed(1))
      : null;
  const waterPct =
    tbw && weight
      ? parseFloat(((tbw / weight) * 100).toFixed(1))
      : null;
  const bmi =
    weight && height
      ? parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1))
      : null;

  // BMR: "kcal  1344" (number follows kcal keyword)
  const bmrMatch = text.match(/kcal\s+([\d,]+)/i);
  const bmr = bmrMatch ? parseInt(bmrMatch[1].replace(",", "")) : null;

  // Visceral fat level: number before "1~9" reference range
  const visceralMatch = text.match(/\b(\d{1,2})\s+1~9\b/);
  const visceralFat = visceralMatch ? parseInt(visceralMatch[1]) : null;

  // SMM (Skeletal Muscle Mass): appears after the 8.0–58.0 scale line
  const smmMatch = text.match(
    /8[,.]0\s+13[,.]0\s+18[,.]0[\s\S]{0,80}?([\d]+[,.]\d+)/
  );
  const muscleMass = smmMatch
    ? parseFloat(smmMatch[1].replace(",", "."))
    : null;

  return {
    weight,
    height,
    bmi,
    body_fat_percentage: bodyFatPct,
    muscle_mass: muscleMass,
    bone_mass: boneMass,
    visceral_fat: visceralFat,
    water_percentage: waterPct,
    basal_metabolic_rate: bmr,
    metabolic_age: null as number | null,
    measurement_date: measurementDate,
  };
}

// ── Standard labeled-format parser ───────────────────────────────────────────
function parseStandardBioimpedance(text: string) {
  const lower = text.toLowerCase();

  // Enhanced patterns to capture more variations
  const weight = toNumber(
    extractField(lower, [
      /peso\s*[:\-]?\s*([\d.,]+)\s*kg/,
      /weight\s*[:\-]?\s*([\d.,]+)\s*kg/,
      /^peso\s*([\d.,]+)/m,
      /\bpeso:\s*([\d.,]+)/,
    ])
  );

  const height = toNumber(
    extractField(lower, [
      /altura\s*[:\-]?\s*([\d.,]+)\s*cm/,
      /height\s*[:\-]?\s*([\d.,]+)\s*cm/,
      /\baltura:\s*([\d.,]+)/,
      /\b(\d{2,3})\s*cm\b/,
    ])
  );

  const bodyFat = toNumber(
    extractField(lower, [
      /gordura\s*(?:corporal)?\s*[:\-]?\s*([\d.,]+)\s*%/,
      /body\s*fat\s*[:\-]?\s*([\d.,]+)\s*%/,
      /% gordura/i,
      /fat\s*%?\s*[:\-]?\s*([\d.,]+)/,
    ])
  );

  const muscleMass = toNumber(
    extractField(lower, [
      /massa\s*(?:muscular|m[úu]scular)\s*[:\-]?\s*([\d.,]+)\s*kg/,
      /muscle\s*mass\s*[:\-]?\s*([\d.,]+)\s*kg/,
      /mmss\s*[:\-]?\s*([\d.,]+)/,
      /muscle\s*[:\-]?\s*([\d.,]+)/,
    ])
  );

  const boneMass = toNumber(
    extractField(lower, [
      /massa\s*(?:[óo]ssea|ossea)\s*[:\-]?\s*([\d.,]+)\s*kg/,
      /bone\s*mass\s*[:\-]?\s*([\d.,]+)\s*kg/,
      /mineral\s*[:\-]?\s*([\d.,]+)/,
    ])
  );

  const visceralFat = toNumber(
    extractField(lower, [
      /gordura\s*visceral\s*[:\-]?\s*([\d.,]+)/,
      /visceral\s*[:\-]?\s*([\d.,]+)/,
      /vf\s*[:\-]?\s*([\d.,]+)/,
    ])
  );

  const water = toNumber(
    extractField(lower, [
      /[áa]gua\s*(?:corporal)?\s*[:\-]?\s*([\d.,]+)\s*%/,
      /water\s*[:\-]?\s*([\d.,]+)\s*%/,
      /água\s*[:\-]?\s*([\d.,]+)/,
      /tbw\s*[:\-]?\s*([\d.,]+)/,
    ])
  );

  const bmr = toNumber(
    extractField(lower, [
      /(?:tmb|bmr|metabolismo\s*basal)\s*[:\-]?\s*([\d.,]+)/,
      /basal\s*metabol\w*\s*[:\-]?\s*([\d.,]+)/,
      /kcal\s*[:\-]?\s*([\d.,]+)/,
      /metabolic\s*rate\s*[:\-]?\s*([\d.,]+)/,
    ])
  );

  const metabolicAge = toNumber(
    extractField(lower, [
      /idade\s*(?:metab[óo]lica|metabolica)\s*[:\-]?\s*([\d.,]+)/,
      /metabolic\s*age\s*[:\-]?\s*([\d.,]+)/,
      /idade\s*[:\-]?\s*([\d.,]+)/,
    ])
  );

  // Calculate BMI if we have weight and height
  let bmi: number | null = null;
  if (weight && height && height > 0) {
    bmi = parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));
  }

  return {
    weight,
    height,
    bmi,
    body_fat_percentage: bodyFat,
    muscle_mass: muscleMass,
    bone_mass: boneMass,
    visceral_fat: visceralFat,
    water_percentage: water,
    basal_metabolic_rate: bmr,
    metabolic_age: metabolicAge,
    measurement_date: new Date().toISOString().split("T")[0],
  };
}

function parseBioimpedance(text: string) {
  // Normalize text for better parsing
  const normalizedText = text
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  console.log("PDF text sample:", normalizedText.substring(0, 500));

  // Try InBody120 format first
  if (isInBody120(normalizedText)) {
    console.log("Detected InBody120 format");
    return parseInBody120(normalizedText);
  }

  // Try standard format
  console.log("Using standard bioimpedance parser");
  return parseStandardBioimpedance(normalizedText);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";
    try {
      // Use pdf-parse correctly to extract text from PDF
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);

      // Extract text from all pages
      if (pdfData.text) {
        extractedText = pdfData.text;
      } else if (pdfData.numpages && pdfData.numpages > 0) {
        // Fallback: try to extract from page structure
        const { PDFDocument } = await import("pdf-lib");
        console.warn("No text extracted, attempting page structure extraction");
      }

      // Log extracted text length for debugging
      console.log(`Extracted ${extractedText.length} characters from PDF`);
    } catch (parseError) {
      console.error("PDF parsing error:", parseError);
      // Continue with empty text - user will see fallback message
    }

    if (!extractedText || extractedText.length === 0) {
      console.warn("No text extracted from PDF");
      return NextResponse.json({
        success: false,
        data: {
          weight: null,
          height: null,
          bmi: null,
          body_fat_percentage: null,
          muscle_mass: null,
          bone_mass: null,
          visceral_fat: null,
          water_percentage: null,
          basal_metabolic_rate: null,
          metabolic_age: null,
          measurement_date: new Date().toISOString().split("T")[0],
          notes: `PDF carregado (${file.name}), mas texto não pôde ser extraído. Preencha manualmente.`,
        },
        message: "⚠️ O PDF foi carregado, mas o texto não pôde ser extraído automaticamente. Por favor, preencha os dados manualmente.",
      });
    }

    const extracted = parseBioimpedance(extractedText);
    const extractedFields = Object.entries(extracted)
      .filter(([key, v]) => key !== "measurement_date" && v !== null && v !== undefined)
      .map(([key]) => key);

    const hasAnyValue = extractedFields.length > 0;

    console.log(`Extracted fields: ${extractedFields.join(", ")}`);

    return NextResponse.json({
      success: hasAnyValue,
      data: {
        weight: extracted.weight ?? null,
        height: extracted.height ?? null,
        bmi: extracted.bmi ?? null,
        body_fat_percentage: extracted.body_fat_percentage ?? null,
        muscle_mass: extracted.muscle_mass ?? null,
        bone_mass: extracted.bone_mass ?? null,
        visceral_fat: extracted.visceral_fat ?? null,
        water_percentage: extracted.water_percentage ?? null,
        basal_metabolic_rate: extracted.basal_metabolic_rate ?? null,
        metabolic_age: extracted.metabolic_age ?? null,
        measurement_date: extracted.measurement_date,
        notes: `PDF importado: ${file.name}. Campos extraídos: ${extractedFields.length > 0 ? extractedFields.join(", ") : "nenhum"}`,
      },
      message: hasAnyValue
        ? `✅ Dados extraídos com sucesso! ${extractedFields.length} campo(s) preenchido(s). Revise antes de salvar.`
        : `⚠️ Não foi possível extrair dados do PDF. Preencha os campos manualmente.`,
      extractedFields: extractedFields,
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      {
        success: false,
        data: {
          weight: null,
          height: null,
          bmi: null,
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
        message:
          "Erro ao processar o PDF. Por favor, preencha os dados manualmente.",
      },
      { status: 200 }
    );
  }
}
