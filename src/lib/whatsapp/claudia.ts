/**
 * Claudia — Orquestrador de resposta automática via WhatsApp
 *
 * Fluxo:
 * 1. Busca histórico de mensagens + perfil de memória do Supabase
 * 2. Monta contexto completo para a IA
 * 3. Gera resposta via OpenAI (GPT-4 Turbo)
 * 4. Salva resposta no banco
 * 5. Envia mensagem via Meta Cloud API
 * 6. Extrai e persiste memória atualizada (background)
 */

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendMetaMessage } from "./meta";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PatientProfile = {
  patient_name: string | null;
  city_preference: string | null;
  main_goal: string | null;
  preferred_period: string | null;
  requested_service: string | null;
  notes: string | null;
};

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
  collect: { name: false, city: false, goal: false, period: false, whatsapp: false },
  handoff: false,
};

// ─── System prompt da Claudia ─────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é Claudia, recepcionista virtual da Dra. Dalila Lucena (Médica Nutróloga, CRM 15295).
Atuação: Obesidade, Performance, Reposição Hormonal, Implantes Hormonais.
Atendimento: João Pessoa e Recife.

PERSONALIDADE
- Simpática, acolhedora, educada e objetiva.
- Usa emojis com moderação (😊✨📅📍💬💉💪), sem exagerar.
- Linguagem simples e humana, sem termos técnicos desnecessários.

MISSÃO
1) Responder dúvidas iniciais sobre consultas e procedimentos (sem fazer diagnóstico).
2) Informar valores, se disponíveis no Contexto do Sistema.
3) Consultar disponibilidade e ajudar a marcar consulta.
4) Coletar dados mínimos: nome, cidade (JP/Recife), objetivo, melhor período.
5) Encaminhar para humano quando necessário.

LIMITES E SEGURANÇA (OBRIGATÓRIO)
- Não prescreva medicamentos, não diagnostique.
- Para sintomas, efeitos colaterais, contraindicações: orientar consulta com a doutora.
- Se urgência (dor forte, falta de ar, desmaio, sangramento): orientar pronto atendimento.

MEMÓRIA
- Use o PERFIL DO PACIENTE abaixo para personalizar a conversa.
- Se o paciente corrigir dados, considere a correção como verdade.
- Nunca exponha IDs internos, tokens ou dados técnicos.

ESTILO
- Respostas curtas (2–5 linhas no WhatsApp), com CTA.
- Sempre termine com uma pergunta quando fizer sentido.

FORMATO DE SAÍDA (OBRIGATÓRIO — nunca explique ao usuário)
No final da resposta inclua:
<<AGENT_META {"intent":"...","collect":{"name":true/false,"city":true/false,"goal":true/false,"period":true/false,"whatsapp":false},"handoff":false/true} >>`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  return key ? createOpenAI({ apiKey: key }) : null;
}

function extractAgentMeta(rawText: string): { cleanText: string; meta: AgentMeta } {
  const regex = /<<AGENT_META\s*({[\s\S]*?})\s*>>/;
  const match = rawText.match(regex);
  if (!match) return { cleanText: rawText.trim(), meta: DEFAULT_META };

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

  return { cleanText: rawText.replace(regex, "").trim(), meta };
}

function buildContextBlock(
  profile: PatientProfile | null,
  memorySummary: string | null,
  profileName: string | null
): string {
  const lines: string[] = ["=== CONTEXTO DO PACIENTE (não mostrar) ==="];

  if (profileName) lines.push(`- Nome no WhatsApp: ${profileName}`);
  if (profile?.patient_name) lines.push(`- Nome confirmado: ${profile.patient_name}`);
  if (profile?.city_preference) lines.push(`- Cidade: ${profile.city_preference}`);
  if (profile?.main_goal) lines.push(`- Objetivo principal: ${profile.main_goal}`);
  if (profile?.preferred_period) lines.push(`- Período preferido: ${profile.preferred_period}`);
  if (profile?.requested_service) lines.push(`- Serviço de interesse: ${profile.requested_service}`);
  if (profile?.notes) lines.push(`- Notas adicionais: ${profile.notes}`);
  if (memorySummary) lines.push(`\nRESUMO DE MEMÓRIA:\n${memorySummary}`);

  if (lines.length === 1) lines.push("- Nenhum dado cadastrado ainda.");

  return lines.join("\n");
}

// ─── Extração e persistência de memória ──────────────────────────────────────

async function extractAndSaveMemory(
  phone: string,
  history: Array<{ role: string; content: string }>,
  adminClient: SupabaseClient
): Promise<void> {
  const openai = getOpenAI();
  if (!openai) return;

  const MEMORY_PROMPT = `Extraia APENAS fatos estáveis desta conversa e retorne JSON puro:
{
  "patient_name": string|null,
  "city_preference": "João Pessoa"|"Recife"|null,
  "main_goal": string|null,
  "preferred_period": "manhã"|"tarde"|"noite"|null,
  "requested_service": "consulta"|"obesidade"|"performance"|"reposicao_hormonal"|"implante_hormonal"|null,
  "notes": string|null,
  "memory_summary": string
}
Regras: sem texto fora do JSON, não invente dados, use null se não houver.
memory_summary: 1-3 linhas resumindo o contexto do paciente para o próximo atendimento.`;

  const historyText = history
    .slice(-20)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: MEMORY_PROMPT,
      prompt: historyText,
    });

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return;

    const parsed = JSON.parse(text.slice(start, end + 1)) as PatientProfile & {
      memory_summary?: string;
    };

    // Atualiza wa_patient_profile
    await adminClient.from("wa_patient_profile").upsert(
      {
        wa_phone: phone,
        patient_name: parsed.patient_name ?? null,
        city_preference: parsed.city_preference ?? null,
        main_goal: parsed.main_goal ?? null,
        preferred_period: parsed.preferred_period ?? null,
        requested_service: parsed.requested_service ?? null,
        notes: parsed.notes ?? null,
        updated_at: new Date().toISOString(),
        last_interaction_at: new Date().toISOString(),
      },
      { onConflict: "wa_phone" }
    );

    // Atualiza memory_summary em wa_conversations
    if (parsed.memory_summary) {
      await adminClient.from("wa_conversations").upsert(
        {
          wa_phone: phone,
          memory_summary: parsed.memory_summary,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "wa_phone" }
      );
    }
  } catch (err) {
    console.error("Memory extraction error:", err);
  }
}

// ─── Função principal ─────────────────────────────────────────────────────────

export async function generateAndSendClaudiaResponse(
  phone: string,
  profileName: string | null,
  adminClient: SupabaseClient
): Promise<{ ok: boolean; sent: boolean; error?: string }> {
  const openai = getOpenAI();
  if (!openai) {
    return { ok: false, sent: false, error: "OPENAI_API_KEY not configured" };
  }

  try {
    // 1. Busca últimas 30 mensagens
    const { data: rawMessages } = await adminClient
      .from("wa_messages")
      .select("role, content, created_at")
      .eq("wa_phone", phone)
      .order("created_at", { ascending: false })
      .limit(30);

    const history = [...(rawMessages ?? [])].reverse();

    // 2. Busca perfil de memória do paciente
    const { data: profileData } = await adminClient
      .from("wa_patient_profile")
      .select("*")
      .eq("wa_phone", phone)
      .single();

    // 3. Busca resumo de memória da conversa
    const { data: convData } = await adminClient
      .from("wa_conversations")
      .select("memory_summary, profile_name")
      .eq("wa_phone", phone)
      .single();

    const memorySummary = convData?.memory_summary ?? null;
    const savedProfileName = convData?.profile_name ?? profileName;

    const contextBlock = buildContextBlock(
      profileData as PatientProfile | null,
      memorySummary,
      savedProfileName
    );

    // 4. Monta histórico no formato AI SDK
    const formattedMessages = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // 5. Gera resposta da Claudia
    const { text } = await generateText({
      model: openai("gpt-4-turbo"),
      system: `${SYSTEM_PROMPT}\n\n${contextBlock}`,
      messages: formattedMessages,
    });

    const { cleanText, meta } = extractAgentMeta(text);

    if (!cleanText) {
      return { ok: false, sent: false, error: "Empty response from AI" };
    }

    // 6. Salva resposta da Claudia no banco
    await adminClient.from("wa_messages").insert({
      wa_phone: phone,
      role: "assistant",
      content: cleanText,
    });

    // 7. Atualiza wa_conversations com intent e handoff
    await adminClient.from("wa_conversations").upsert(
      {
        wa_phone: phone,
        profile_name: savedProfileName,
        last_intent: meta.intent,
        handoff_requested: meta.handoff,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "wa_phone" }
    );

    // 8. Envia mensagem via Meta Cloud API
    const sendResult = await sendMetaMessage(phone, cleanText);

    // 9. Extrai e persiste memória em background (sem await para não bloquear)
    extractAndSaveMemory(phone, history as Array<{ role: string; content: string }>, adminClient).catch(
      (err) => console.error("Background memory update error:", err)
    );

    return {
      ok: true,
      sent: sendResult.ok,
      error: sendResult.ok ? undefined : sendResult.error,
    };
  } catch (err) {
    console.error("Claudia orchestrator error:", err);
    return { ok: false, sent: false, error: String(err) };
  }
}
