import { GoogleGenAI } from "@google/genai";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_GEMINI_API_KEY?: string;
      NEXT_PUBLIC_GOOGLE_API_KEY?: string;
    }
  }
}

// ── Types ─────────────────────────────────────────────────────────────

export interface AiAnalysisResult {
  /** Extracted structured data */
  extractedData: {
    weight: number | null;
    height: number | null;
    bmi: number | null;
    body_fat_percentage: number | null;
    muscle_mass: number | null;
    skeletal_muscle_mass: number | null;
    bone_mass: number | null;
    visceral_fat: number | null;
    water_percentage: number | null;
    basal_metabolic_rate: number | null;
    metabolic_age: number | null;
    measurement_date: string | null;
    // Segmental data
    segmental_lean?: {
      leftArm?: number;
      rightArm?: number;
      trunk?: number;
      leftLeg?: number;
      rightLeg?: number;
    };
    segmental_fat?: {
      leftArm?: number;
      rightArm?: number;
      trunk?: number;
      leftLeg?: number;
      rightLeg?: number;
    };
  };
  /** AI-generated health insights in Portuguese */
  insights: string[];
  /** Overall health score (0-100) */
  healthScore: number | null;
  /** Recommendations from AI */
  recommendations: string[];
  /** Summary paragraph */
  summary: string;
  /** Confidence level of extraction (0-1) */
  confidence: number;
  /** Device/brand detected */
  deviceDetected: string | null;
  /** Raw fields extracted */
  fieldsExtracted: string[];
}

export interface GeminiAnalyzerOptions {
  /** Include health recommendations */
  includeRecommendations?: boolean;
  /** Patient context for personalized analysis */
  patientContext?: {
    age?: number;
    gender?: "male" | "female";
    previousWeight?: number;
    previousFat?: number;
    previousMuscle?: number;
  };
}

// ── Analyzer ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é um especialista em análise de exames de bioimpedância.
Sua função é extrair TODOS os dados possíveis de um PDF de exame de bioimpedância e fornecer uma análise clínica detalhada.

REGRAS:
1. Extraia TODOS os valores numéricos encontrados no exame
2. Identifique o equipamento/marca (InBody, Tanita, Omron, etc.)
3. Forneça insights clínicos relevantes em português brasileiro
4. Dê recomendações práticas baseadas nos dados
5. Calcule um score de saúde geral (0-100) baseado nos indicadores
6. Se houver dados segmentares (por região do corpo), extraia também
7. SEMPRE responda em JSON válido, sem markdown

RESPONDA EXATAMENTE neste formato JSON:
{
  "extractedData": {
    "weight": <number|null>,
    "height": <number|null>,
    "bmi": <number|null>,
    "body_fat_percentage": <number|null>,
    "muscle_mass": <number|null>,
    "skeletal_muscle_mass": <number|null>,
    "bone_mass": <number|null>,
    "visceral_fat": <number|null>,
    "water_percentage": <number|null>,
    "basal_metabolic_rate": <number|null>,
    "metabolic_age": <number|null>,
    "measurement_date": "<YYYY-MM-DD|null>",
    "segmental_lean": {
      "leftArm": <number|null>,
      "rightArm": <number|null>,
      "trunk": <number|null>,
      "leftLeg": <number|null>,
      "rightLeg": <number|null>
    },
    "segmental_fat": {
      "leftArm": <number|null>,
      "rightArm": <number|null>,
      "trunk": <number|null>,
      "leftLeg": <number|null>,
      "rightLeg": <number|null>
    }
  },
  "insights": ["<insight em pt-BR>", "..."],
  "healthScore": <0-100|null>,
  "recommendations": ["<recomendação em pt-BR>", "..."],
  "summary": "<resumo geral em pt-BR>",
  "confidence": <0.0-1.0>,
  "deviceDetected": "<nome do equipamento|null>",
  "fieldsExtracted": ["weight", "bmi", "..."]
}`;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/**
 * Analyze a bioimpedance PDF using Gemini AI
 */
export async function analyzeBioimpedancePdf(
  pdfBuffer: ArrayBuffer,
  options: GeminiAnalyzerOptions = {}
): Promise<AiAnalysisResult> {
  const client = getClient();
  if (!client) {
    throw new Error("GOOGLE_GEMINI_API_KEY not configured");
  }

  const base64Pdf = Buffer.from(pdfBuffer).toString("base64");

  let userPrompt = "Analise este exame de bioimpedância em PDF. Extraia todos os dados e forneça uma análise clínica completa.";

  if (options.patientContext) {
    const ctx = options.patientContext;
    const parts: string[] = [];
    if (ctx.age) parts.push(`idade: ${ctx.age} anos`);
    if (ctx.gender) parts.push(`sexo: ${ctx.gender === "male" ? "masculino" : "feminino"}`);
    if (ctx.previousWeight) parts.push(`peso anterior: ${ctx.previousWeight}kg`);
    if (ctx.previousFat) parts.push(`gordura anterior: ${ctx.previousFat}%`);
    if (ctx.previousMuscle) parts.push(`massa muscular anterior: ${ctx.previousMuscle}kg`);
    if (parts.length > 0) {
      userPrompt += `\n\nContexto do paciente: ${parts.join(", ")}.`;
    }
  }

  if (options.includeRecommendations === false) {
    userPrompt += "\n\nNão inclua recomendações, apenas dados extraídos.";
  }

  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Pdf,
            },
          },
          { text: userPrompt },
        ],
      },
    ],
    config: {
      temperature: 0.1,
      maxOutputTokens: 4096,
    },
  });

  const rawText = response.text?.trim() || "";

  // Strip markdown code fence if present
  const jsonText = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(jsonText) as AiAnalysisResult;
    return sanitizeResult(parsed);
  } catch {
    console.error("[gemini-pdf-analyzer] Failed to parse JSON response:", rawText.slice(0, 500));
    throw new Error("AI retornou resposta inválida. Tente novamente.");
  }
}

/**
 * Analyze extracted text (fallback for when PDF binary isn't available)
 */
export async function analyzeExtractedText(
  text: string,
  options: GeminiAnalyzerOptions = {}
): Promise<AiAnalysisResult> {
  const client = getClient();
  if (!client) {
    throw new Error("GOOGLE_GEMINI_API_KEY not configured");
  }

  let userPrompt = `Analise o seguinte texto extraído de um exame de bioimpedância:\n\n---\n${text}\n---\n\nExtraia todos os dados e forneça uma análise clínica completa.`;

  if (options.patientContext) {
    const ctx = options.patientContext;
    const parts: string[] = [];
    if (ctx.age) parts.push(`idade: ${ctx.age} anos`);
    if (ctx.gender) parts.push(`sexo: ${ctx.gender === "male" ? "masculino" : "feminino"}`);
    if (parts.length > 0) {
      userPrompt += `\n\nContexto do paciente: ${parts.join(", ")}.`;
    }
  }

  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: SYSTEM_PROMPT },
          { text: userPrompt },
        ],
      },
    ],
    config: {
      temperature: 0.1,
      maxOutputTokens: 4096,
    },
  });

  const rawText = response.text?.trim() || "";
  const jsonText = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(jsonText) as AiAnalysisResult;
    return sanitizeResult(parsed);
  } catch {
    console.error("[gemini-text-analyzer] Failed to parse JSON:", rawText.slice(0, 500));
    throw new Error("AI retornou resposta inválida. Tente novamente.");
  }
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!(process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
}

// ── Helpers ───────────────────────────────────────────────────────────

function sanitizeResult(raw: AiAnalysisResult): AiAnalysisResult {
  const _data = raw.extractedData || {} as AiAnalysisResult["extractedData"];

  return {
    extractedData: {
      weight: safeNum(data.weight),
      height: safeNum(data.height),
      bmi: safeNum(data.bmi),
      body_fat_percentage: safeNum(data.body_fat_percentage),
      muscle_mass: safeNum(data.muscle_mass),
      skeletal_muscle_mass: safeNum(data.skeletal_muscle_mass),
      bone_mass: safeNum(data.bone_mass),
      visceral_fat: safeNum(data.visceral_fat),
      water_percentage: safeNum(data.water_percentage),
      basal_metabolic_rate: safeNum(data.basal_metabolic_rate),
      metabolic_age: safeNum(data.metabolic_age),
      measurement_date: data.measurement_date || null,
      segmental_lean: data.segmental_lean || undefined,
      segmental_fat: data.segmental_fat || undefined,
    },
    insights: Array.isArray(raw.insights) ? raw.insights : [],
    healthScore: safeNum(raw.healthScore),
    recommendations: Array.isArray(raw.recommendations) ? raw.recommendations : [],
    summary: typeof raw.summary === "string" ? raw.summary : "",
    confidence: Math.min(1, Math.max(0, Number(raw.confidence) || 0)),
    deviceDetected: typeof raw.deviceDetected === "string" ? raw.deviceDetected : null,
    fieldsExtracted: Array.isArray(raw.fieldsExtracted) ? raw.fieldsExtracted : [],
  };
}

function safeNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
