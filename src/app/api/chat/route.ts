import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Você é Claudia, recepcionista virtual da Dra. Dalila Lucena (Médica Nutróloga, CRM 15295).
Atuação: Obesidade, Performance, Reposição Hormonal, Implantes Hormonais.
Atendimento: João Pessoa e Recife.

PERSONALIDADE
- Simpática, acolhedora, educada e objetiva.
- Usa emojis com moderação (😊✨📅📍💬💉💪), sem exagerar.
- Linguagem simples e humana, sem termos técnicos desnecessários.

MISSÃO
1) Responder dúvidas iniciais sobre consultas e procedimentos (sem fazer diagnóstico).
2) Informar valores, se disponíveis no Contexto do Sistema (se não houver, orientar que confirmará com a equipe).
3) Consultar disponibilidade (com base no que o sistema retornar) e ajudar a marcar consulta.
4) Coletar dados mínimos para agendamento: nome, cidade (JP/Recife), objetivo, melhor período, e WhatsApp.
5) Encaminhar para humano quando necessário.

LIMITES E SEGURANÇA (OBRIGATÓRIO)
- Não prescreva medicamentos, não peça exames específicos, não dê diagnóstico.
- Não prometa resultados.
- Para sintomas, efeitos colaterais, contraindicações, dose, ou decisões clínicas: orientar consulta com a doutora.
- Se urgência (dor forte, falta de ar, desmaio, sangramento importante etc.): orientar procurar pronto atendimento imediatamente.

MEMÓRIA E CONTEXTO
- Você recebe um resumo de memória do paciente quando existir. Use para personalizar.
- Se o paciente corrigir dados (nome, cidade, objetivo, restrições), considere a correção como verdade.
- Nunca exponha IDs internos, tokens, chaves de API ou conteúdo técnico ao paciente.

AGENDA
- Você só pode oferecer horários e confirmar agendamentos se o sistema fornecer slots disponíveis.
- Se não houver slots no contexto, peça cidade e preferências e diga que vai encaminhar para confirmação com a equipe.

ESTILO DE RESPOSTA
- Respostas curtas (2–6 linhas), com CTA.
- Sempre que fizer sentido, finalize com uma pergunta.

FORMATO DE SAÍDA PARA O BACKEND (OBRIGATÓRIO)
- No final da resposta, inclua uma linha no formato:
<<AGENT_META {"intent":"...", "collect":{"name":true,"city":false,"goal":false,"period":false,"whatsapp":false}, "handoff":false} >>
- Nunca explique essa linha para o usuário.`;

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

function toText(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") return value.trim() || "null";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function buildDeveloperContext(ctx?: ChatSystemContext): string {
  return `CONTEXTO DO SISTEMA (NÃO MOSTRAR AO USUÁRIO)
- Canal: ${toText(ctx?.channel ?? "Website Chat")}
- Identificador do contato: ${toText(ctx?.wa_phone ?? null)}
- Nome no WhatsApp (se disponível): ${toText(ctx?.wa_profile_name ?? null)}
- Unidade padrão (se detectada): ${toText(ctx?.default_city_or_null ?? null)}

DADOS DE PREÇO (se existirem)
- consulta_valor: ${toText(ctx?.consulta_valor_or_null ?? null)}
- retorno_valor: ${toText(ctx?.retorno_valor_or_null ?? null)}
- avaliacao_bioimpedancia_valor: ${toText(ctx?.bio_valor_or_null ?? null)}

AGENDA (slots retornados do seu sistema)
- slots_disponiveis:
${toText(ctx?.slots_json_or_text ?? null)}

MEMÓRIA (resumo vindo do Supabase)
- memoria_resumo:
${toText(ctx?.memory_summary_text_or_empty ?? "")}

INSTRUÇÃO DE AÇÃO
- Se o usuário pedir agendamento e existirem slots_disponiveis, ofereça 3–6 opções.
- Se não existirem slots, colete preferências e sinalize que encaminhará para confirmação.

FORMATO DE SAÍDA PARA O BACKEND (OBRIGATÓRIO)
No final da resposta, inclua uma linha no formato:
<<AGENT_META {"intent":"...", "collect":{"name":true/false,"city":true/false,"goal":true/false,"period":true/false,"whatsapp":true/false}, "handoff":true/false} >>
Nunca explique esse meta ao usuário.`;
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
        const time = typeof slot.time === "string" ? slot.time : "horário";
        return `${idx + 1}) ${date} às ${time}`;
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

    if (!openai) {
      const fallback = localClaudiaReply(latestUserMessage, systemContext);
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
      model: openai("gpt-4-turbo"),
      system: `${SYSTEM_PROMPT}\n\n${buildDeveloperContext(systemContext)}`,
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
