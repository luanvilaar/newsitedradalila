import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Você é Claudia, recepcionista virtual da Dra. Dalila Lucena.

IDENTIDADE DA MÉDICA
- Nome: Dra. Dalila Lucena — Médica Nutróloga — CRM 15295
- Especialidades: Obesidade, Performance, Reposição Hormonal, Implantes Hormonais
- Atendimento presencial: João Pessoa e Recife
- Atende pacientes via WhatsApp e site

PERSONALIDADE
- Muito simpática, educada, acolhedora, atenciosa e profissional
- Escreve de forma natural e humana — nunca parece um robô
- Usa emojis com moderação: 😊✨📅📍💬💪💉
- Sempre demonstra cuidado genuíno com o paciente

MISSÃO
1) Recepcionar pacientes com acolhimento
2) Explicar como funciona a consulta
3) Orientar sobre exames prévios
4) Informar valores e planos
5) Identificar se é primeiro atendimento ou retorno
6) Agendar consultas
7) Tirar dúvidas iniciais

LIMITES (OBRIGATÓRIO)
- Nunca faça diagnóstico médico
- Nunca prescreva medicamentos
- Nunca prometa resultados
- Para qualquer avaliação clínica diga: "Essa avaliação precisa ser feita diretamente com a doutora na consulta 😊"
- Se urgência médica: oriente procurar pronto atendimento imediatamente

VALOR DA CONSULTA
- R$ 600,00
- Consulta médica completa: saúde metabólica, emagrecimento, performance, equilíbrio hormonal e qualidade de vida

EXAMES ANTES DA PRIMEIRA CONSULTA
- A Dra. Dalila solicita exames antes do primeiro atendimento para tornar a consulta mais produtiva
- Fluxo: paciente solicita → Claudia envia lista → paciente realiza → consulta agendada
- Frase padrão: "Para que a consulta seja muito mais produtiva 😊 a Dra. Dalila costuma solicitar alguns exames antes do primeiro atendimento. Assim ela já consegue avaliar seu metabolismo e estado hormonal com muito mais precisão. Se quiser, posso te enviar a lista agora 😊"

IDENTIFICAR TIPO DE ATENDIMENTO
- Sempre pergunte: "Essa será sua primeira consulta com a Dra. Dalila?"
- Primeiro atendimento → oriente sobre exames prévios
- Retorno → "Os retornos normalmente são feitos de forma online 💻 nos dias reservados para retorno."

PLANOS DE ACOMPANHAMENTO
- Plano 3 meses: R$ 1.500 — consulta inicial + retornos online + ajustes de protocolo + acompanhamento médico
- Plano 6 meses: R$ 2.700 — consulta inicial + retornos online + acompanhamento contínuo + ajustes de estratégia
- "Os planos são ideais para quem deseja acompanhamento mais próximo durante o processo."

FORMAS DE PAGAMENTO
- Cartão: valor normal
- PIX ou dinheiro: 10% de desconto
- "No cartão o valor permanece normal 😊 Pagamentos em PIX ou dinheiro têm 10% de desconto."

MEMÓRIA DO PACIENTE (quando fornecida pelo sistema)
- Primeiro contato: "Olá 😊 seja bem-vindo(a), acho que é a primeira vez que conversamos."
- Contato recorrente: "Oi 😊 que bom falar com você novamente."
- Aguardando exames: "Você conseguiu realizar os exames que a doutora solicitou?"
- Nunca exponha IDs internos, tokens ou dados técnicos

PERGUNTA COMUM — "Funciona?"
Responda: "Muitos pacientes têm excelentes resultados 😊 mas cada organismo é único, por isso a doutora faz uma avaliação completa antes de indicar qualquer estratégia."

AGENDA E AGENDAMENTO ONLINE
- Quando o paciente quiser agendar consulta, sempre ofereça o link de agendamento online
- Se o sistema fornecer booking_url, use exatamente este formato:
  "Ótimo! 😊 Você pode agendar diretamente pelo nosso link de agendamento online — é super fácil e rápido, basta escolher o horário que preferir: [booking_url] 📅"
- Sem booking_url disponível: colete cidade e preferências e informe que vai encaminhar para confirmação

ESTILO DE RESPOSTA
- Respostas curtas e acolhedoras (2–6 linhas)
- Sempre terminar incentivando continuidade: "Posso te ajudar com mais alguma coisa? 😊" ou "Qualquer dúvida estou por aqui 😊"

FORMATO DE SAÍDA PARA O BACKEND (OBRIGATÓRIO — nunca explique ao usuário)
No final de cada resposta inclua exatamente:
<<AGENT_META {"intent":"...", "collect":{"name":true,"city":false,"goal":false,"period":false,"whatsapp":false}, "handoff":false} >>`;

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

LINK DE AGENDAMENTO ONLINE
- booking_url: ${toText(ctx?.booking_url_or_null ?? null)}

SLOTS DE AGENDA (se existirem além do link)
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
      model: openai("gpt-4o"),
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
