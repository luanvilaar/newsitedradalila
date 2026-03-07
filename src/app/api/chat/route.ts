import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { CLAUDIA_SYSTEM_PROMPT, buildClaudiaContext } from "@/lib/ai/claudia-system-prompt";
import {
  getAvailableSlots,
  isCalendarIntegrationActive,
} from "@/lib/google-calendar";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatSystemContext {
  channel?: string;
  wa_phone?: string;
  wa_profile_name?: string;
  default_city_or_null?: string | null;
  consulta_valor_or_null?: string | null;
  retorno_valor_or_null?: string | null;
  bio_valor_or_null?: string | null;
  slots_json_or_text?: unknown;
  booking_url_or_null?: string | null;
  memory_summary_text_or_empty?: string;
}

type AgentMeta = {
  intent: string;
  collect: {
    name: boolean;
    city: boolean;
    goal: boolean;
    period: boolean;
    whatsapp: boolean;
  };
  handoff: boolean;
};

const DEFAULT_META: AgentMeta = {
  intent: "unknown",
  collect: {
    name: false,
    city: false,
    goal: false,
    period: false,
    whatsapp: false,
  },
  handoff: false,
};

/**
 * SEGURANÇA: Nunca leia arquivos do filesystem em runtime para obter segredos.
 * Use apenas variáveis de ambiente (process.env) — definidas no .env.local
 * ou nas variáveis de ambiente do servidor de produção.
 */
function readOpenAiKey(): string | null {
  return process.env.OPENAI_API_KEY || null;
}



function extractAgentMeta(rawText: string): { cleanText: string; meta: AgentMeta } {
  const regex = /<<AGENT_META\s*({[\s\S]*?})\s*>>/;
  const match = rawText.match(regex);

  if (!match) {
    return { cleanText: rawText.trim(), meta: DEFAULT_META };
  }

  let meta = DEFAULT_META;
  try {
    const parsed = JSON.parse(match[1]) as Partial<AgentMeta>;
    meta = {
      intent: parsed.intent || DEFAULT_META.intent,
      collect: {
        name: Boolean(parsed.collect?.name),
        city: Boolean(parsed.collect?.city),
        goal: Boolean(parsed.collect?.goal),
        period: Boolean(parsed.collect?.period),
        whatsapp: Boolean(parsed.collect?.whatsapp),
      },
      handoff: Boolean(parsed.handoff),
    };
  } catch {
    meta = DEFAULT_META;
  }

  return {
    cleanText: rawText.replace(regex, "").trim(),
    meta,
  };
}

function localClaudiaReply(
  userText: string,
  systemContext?: ChatSystemContext
): { message: string; meta: AgentMeta } {
  const normalized = userText.toLowerCase();
  const slots = Array.isArray(systemContext?.slots_json_or_text)
    ? systemContext?.slots_json_or_text
    : [];

  const wantsSchedule =
    normalized.includes("agendar") ||
    normalized.includes("consulta") ||
    normalized.includes("horário") ||
    normalized.includes("horario");

  const asksPrice =
    normalized.includes("valor") ||
    normalized.includes("preço") ||
    normalized.includes("preco") ||
    normalized.includes("quanto custa");

  if (wantsSchedule && slots.length > 0) {
    const topSlots = slots.slice(0, 3) as Array<Record<string, unknown>>;
    const options = topSlots
      .map((slot, idx) => {
        const date = typeof slot.date === "string" ? slot.date : "data";
        const day = typeof slot.dayOfWeek === "string" ? slot.dayOfWeek : "";
        const time = typeof slot.time === "string" ? slot.time : "horário";
        return `${idx + 1}) ${day}, ${date} às ${time}`;
      })
      .join("\n");

    return {
      message: `Perfeito 😊 Tenho estes horários disponíveis:\n${options}\n\nQual opção você prefere? 📅`,
      meta: {
        intent: "schedule",
        collect: {
          name: false,
          city: false,
          goal: true,
          period: false,
          whatsapp: true,
        },
        handoff: false,
      },
    };
  }

  if (asksPrice) {
    const consulta = systemContext?.consulta_valor_or_null;
    if (consulta) {
      return {
        message: `Claro 😊 A consulta está no valor de ${consulta}.\nVocê prefere atendimento em João Pessoa ou Recife? 📍`,
        meta: {
          intent: "pricing",
          collect: {
            name: false,
            city: true,
            goal: false,
            period: false,
            whatsapp: false,
          },
          handoff: false,
        },
      };
    }

    return {
      message:
        "Consigo te ajudar sim 😊 Os valores podem variar conforme o tipo de atendimento. Você busca consulta para obesidade, performance ou reposição/implante? 💬",
      meta: {
        intent: "pricing",
        collect: {
          name: false,
          city: false,
          goal: true,
          period: false,
          whatsapp: false,
        },
        handoff: false,
      },
    };
  }

  return {
    message:
      "Perfeito 😊 Posso te ajudar com agendamento, valores e dúvidas iniciais sobre os procedimentos. Você quer agendar consulta 📅 ou tirar uma dúvida específica?",
    meta: {
      intent: "general_info",
      collect: {
        name: false,
        city: true,
        goal: true,
        period: true,
        whatsapp: true,
      },
      handoff: false,
    },
  };
}

// ── Detectar se o usuário quer agendar ─────────────────────────────────────
function detectsSchedulingIntent(text: string): boolean {
  const normalized = text.toLowerCase();
  const keywords = [
    "agendar", "agendamento", "marcar", "consulta",
    "horário", "horario", "disponível", "disponivel",
    "quando posso", "data", "agenda", "cancelar",
    "desmarcar", "remarcar",
    // intenção de período/tempo
    "semana", "próxima semana", "proxima semana",
    "próximo", "proximo", "próxima", "proxima",
    "amanhã", "amanha", "hoje", "fim de semana",
    "segunda", "terça", "quarta", "quinta", "sexta",
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
    // intenção de atendimento
    "atendimento", "disponibilidade", "vaga", "vagas",
    "período", "periodo", "turno", "manhã", "tarde",
    // cidades (indica intenção de agendar em determinada cidade)
    "joao pessoa", "joão pessoa", "recife", "jp",
  ];
  return keywords.some((kw) => normalized.includes(kw));
}

// ── Buscar slots reais do Google Calendar se possível ──────────────────────
async function enrichContextWithSlots(
  ctx: ChatSystemContext | undefined,
  userMessage: string
): Promise<ChatSystemContext> {
  const enriched: ChatSystemContext = { ...ctx };

  if (detectsSchedulingIntent(userMessage)) {
    const integrationActive = isCalendarIntegrationActive();
    console.log("[Chat] Scheduling intent detected. Calendar integration active:", integrationActive);

    if (integrationActive) {
      try {
        const slots = await getAvailableSlots(90); // 3 meses de disponibilidade
        console.log(`[Chat] Retrieved ${slots.length} available slots from Google Calendar API`);

        // Passar todos os slots do mês (agenda completa)
        const topSlots = slots;
        if (topSlots.length > 0) {
          enriched.slots_json_or_text = topSlots;
          console.log(`[Chat] Using top ${topSlots.length} slots in chat context`);
        } else {
          console.log("[Chat] No available slots found in calendar");
        }
      } catch (error) {
        console.error("[Chat] Erro ao buscar slots para o chat:", error);
      }
    } else {
      console.log("[Chat] Calendar integration not active - skipping slot retrieval");
    }
  }

  return enriched;
}

export async function POST(req: NextRequest) {
  // ── Rate limiting: máximo 20 requisições por minuto por IP ────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rateResult = checkRateLimit(`chat:${ip}`, 20, 60);
  if (!rateResult.allowed) {
    return Response.json(
      { error: `Muitas requisições. Tente novamente em ${rateResult.resetIn}s.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateResult.resetIn),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const { messages, systemContext } = (await req.json()) as {
      messages: ChatMessage[];
      systemContext?: ChatSystemContext;
    };

    const apiKey = readOpenAiKey();
    const openai = apiKey ? createOpenAI({ apiKey }) : null;
    const latestUserMessage =
      [...messages].reverse().find((item) => item.role === "user")?.content || "";

    // Enriquecer contexto com slots reais do Google Calendar
    const enrichedContext = await enrichContextWithSlots(systemContext, latestUserMessage);

    if (!openai) {
      const fallback = localClaudiaReply(latestUserMessage, enrichedContext);
      return Response.json({
        message: fallback.message,
        rawMessage: `${fallback.message}\n<<AGENT_META ${JSON.stringify(fallback.meta)} >>`,
        agentMeta: fallback.meta,
        fallbackMode: true,
      });
    }

    // Formatar mensagens para o modelo
    const formattedMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Gerar resposta com OpenAI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `${CLAUDIA_SYSTEM_PROMPT}\n\n${buildClaudiaContext(enrichedContext)}`,
      messages: formattedMessages,
    });

    const { cleanText, meta } = extractAgentMeta(text);
    const rawMessageWithMeta = /<<AGENT_META\s*({[\s\S]*?})\s*>>/.test(text)
      ? text
      : `${text.trim()}\n<<AGENT_META ${JSON.stringify(DEFAULT_META)} >>`;

    return Response.json({
      message: cleanText,
      rawMessage: rawMessageWithMeta,
      agentMeta: meta,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
