import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";

type MemoryProfile = {
  patient_name: string | null;
  city_preference: "João Pessoa" | "Recife" | null;
  main_goal: string | null;
  preferred_period: "manhã" | "tarde" | "noite" | null;
  requested_service:
    | "consulta"
    | "obesidade"
    | "performance"
    | "reposicao_hormonal"
    | "implante_hormonal"
    | null;
  notes: string | null;
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const MEMORY_WRITER_PROMPT = `Você é um extrator de memória para um CRM médico (recepção).
A partir da última mensagem do usuário e do histórico recente, extraia APENAS fatos estáveis e úteis para o próximo atendimento.
Retorne JSON estrito com campos:

{
  "patient_name": string|null,
  "city_preference": "João Pessoa"|"Recife"|null,
  "main_goal": string|null,
  "preferred_period": "manhã"|"tarde"|"noite"|null,
  "requested_service": "consulta"|"obesidade"|"performance"|"reposicao_hormonal"|"implante_hormonal"|null,
  "notes": string|null
}

Regras:
- Não invente dados.
- Se não houver, use null.
- Sem texto fora do JSON.`;

function readOpenAiKey(): string | null {
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }

  try {
    const candidateDirs = [
      process.cwd(),
      process.env.PWD,
      process.env.INIT_CWD,
      join(process.cwd(), "Desktop", "Projetos", "DT"),
    ].filter((item): item is string => Boolean(item));

    for (const baseDir of candidateDirs) {
      const envPath = join(baseDir, ".env.local");
      if (!existsSync(envPath)) continue;

      const envContent = readFileSync(envPath, "utf8");
      const line = envContent
        .split("\n")
        .find((item) => item.trim().startsWith("OPENAI_API_KEY="));

      if (!line) continue;
      const value = line.split("=").slice(1).join("=").trim();
      if (value) return value;
    }

    return null;
  } catch {
    return null;
  }
}

const EMPTY_MEMORY: MemoryProfile = {
  patient_name: null,
  city_preference: null,
  main_goal: null,
  preferred_period: null,
  requested_service: null,
  notes: null,
};

function normalizeMemory(raw: unknown): MemoryProfile {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const city = data.city_preference;
  const period = data.preferred_period;
  const service = data.requested_service;

  return {
    patient_name: typeof data.patient_name === "string" ? data.patient_name : null,
    city_preference: city === "João Pessoa" || city === "Recife" ? city : null,
    main_goal: typeof data.main_goal === "string" ? data.main_goal : null,
    preferred_period:
      period === "manhã" || period === "tarde" || period === "noite" ? period : null,
    requested_service:
      service === "consulta" ||
      service === "obesidade" ||
      service === "performance" ||
      service === "reposicao_hormonal" ||
      service === "implante_hormonal"
        ? service
        : null,
    notes: typeof data.notes === "string" ? data.notes : null,
  };
}

function extractFirstJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function localMemoryFallback(inputText: string): MemoryProfile {
  const normalized = inputText.toLowerCase();

  const city: MemoryProfile["city_preference"] = normalized.includes("recife")
    ? "Recife"
    : normalized.includes("joão pessoa") || normalized.includes("joao pessoa")
      ? "João Pessoa"
      : null;

  const preferredPeriod: MemoryProfile["preferred_period"] = normalized.includes("manhã") ||
    normalized.includes("manha")
    ? "manhã"
    : normalized.includes("tarde")
      ? "tarde"
      : normalized.includes("noite")
        ? "noite"
        : null;

  const requestedService: MemoryProfile["requested_service"] = normalized.includes("obes")
    ? "obesidade"
    : normalized.includes("performance")
      ? "performance"
      : normalized.includes("repos")
        ? "reposicao_hormonal"
        : normalized.includes("implante")
          ? "implante_hormonal"
          : normalized.includes("consulta")
            ? "consulta"
            : null;

  const mainGoal = normalized.includes("perder peso") || normalized.includes("emagrec")
    ? "Emagrecimento"
    : null;

  return {
    patient_name: null,
    city_preference: city,
    main_goal: mainGoal,
    preferred_period: preferredPeriod,
    requested_service: requestedService,
    notes: null,
  };
}

export async function POST(req: Request) {
  try {
    const apiKey = readOpenAiKey();
    const openai = apiKey ? createOpenAI({ apiKey }) : null;

    const { history, latestUserMessage } = (await req.json()) as {
      history?: ChatMessage[];
      latestUserMessage?: string;
    };

    const safeHistory = Array.isArray(history) ? history.slice(-20) : [];

    if (!openai) {
      const rawContext = `${safeHistory.map((m) => m.content).join("\n")}\n${latestUserMessage || ""}`;
      return Response.json({
        memory: localMemoryFallback(rawContext),
        fallbackMode: true,
      });
    }

    const historyText = safeHistory
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: MEMORY_WRITER_PROMPT,
      prompt: `HISTÓRICO RECENTE:\n${historyText || "(vazio)"}\n\nÚLTIMA MENSAGEM DO USUÁRIO:\n${latestUserMessage || "(vazio)"}`,
    });

    const parsed = extractFirstJson(text);
    const memory = normalizeMemory(parsed);

    return Response.json({ memory });
  } catch (error) {
    console.error("Memory writer error:", error);
    return Response.json({ memory: EMPTY_MEMORY });
  }
}
