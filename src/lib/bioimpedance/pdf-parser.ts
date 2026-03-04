export interface ParsedBioimpedanceData {
  weight: number | null;
  height: number | null;
  bmi: number | null;
  body_fat_percentage: number | null;
  muscle_mass: number | null;
  bone_mass: number | null;
  visceral_fat: number | null;
  water_percentage: number | null;
  basal_metabolic_rate: number | null;
  metabolic_age: number | null;
  measurement_date: string;
  notes?: string;
}

export interface ParseResult {
  data: ParsedBioimpedanceData;
  extractedFields: string[];
  parser: "inbody" | "standard";
}

const EMPTY_PARSED_DATA: ParsedBioimpedanceData = {
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
};

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

function isInBody(text: string): boolean {
  return /inbody/i.test(text);
}

function parseInBody(text: string): ParsedBioimpedanceData {
  const heightMatch = text.match(/\b(\d{2,3})\s*cm\b/i);
  const height = heightMatch ? Number(heightMatch[1]) : null;

  const dateMatch = text.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  const measurementDate = dateMatch
    ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`
    : new Date().toISOString().split("T")[0];

  const tbwMatch = text.match(/\(L\)\s+([\d,]+)/);
  const tbw = tbwMatch ? parseFloat(tbwMatch[1].replace(",", ".")) : null;

  const kgTablePattern = /\(kg\)\s+([\d,]+)/g;
  const kgValues: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = kgTablePattern.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(",", "."));
    if (!Number.isNaN(value) && value > 0) kgValues.push(value);
  }

  const heavyCandidates = kgValues.filter((value) => value >= 40);
  const weight = heavyCandidates.length ? Math.max(...heavyCandidates) : null;

  const boneMass = kgValues.find((value) => value >= 2 && value <= 6) ?? null;
  const bfmCandidates = kgValues.filter(
    (value) => value > 6 && weight !== null && value < weight * 0.7
  );
  const bfm = bfmCandidates.length ? Math.max(...bfmCandidates) : null;

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

  const bmrMatch = text.match(/kcal\s+([\d,]+)/i);
  const bmr = bmrMatch ? parseInt(bmrMatch[1].replace(",", ""), 10) : null;

  const visceralMatch = text.match(/\b(\d{1,2})\s+1~9\b/);
  const visceralFat = visceralMatch ? parseInt(visceralMatch[1], 10) : null;

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
    metabolic_age: null,
    measurement_date: measurementDate,
  };
}

function parseStandard(text: string): ParsedBioimpedanceData {
  const lower = text.toLowerCase();

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
    ])
  );

  const bmi =
    weight && height && height > 0
      ? parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1))
      : null;

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

export function parseBioimpedanceText(inputText: string): ParseResult {
  const normalizedText = inputText.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  if (!normalizedText) {
    return {
      data: { ...EMPTY_PARSED_DATA },
      extractedFields: [],
      parser: "standard",
    };
  }

  const parser = isInBody(normalizedText) ? "inbody" : "standard";
  const parsed = parser === "inbody" ? parseInBody(normalizedText) : parseStandard(normalizedText);

  const extractedFields = Object.entries(parsed)
    .filter(([key, value]) => key !== "measurement_date" && value !== null && value !== undefined)
    .map(([key]) => key);

  return {
    data: {
      ...EMPTY_PARSED_DATA,
      ...parsed,
    },
    extractedFields,
    parser,
  };
}

export function hasValidPdfSignature(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}
