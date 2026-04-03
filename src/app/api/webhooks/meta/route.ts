import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  verifyMetaWebhookChallenge,
  extractMetaInboundMessages,
  type MetaWebhookPayload,
} from "@/lib/whatsapp/meta";
import { generateAndSendClaudiaResponse } from "@/lib/whatsapp/claudia";

export const runtime = "nodejs";

/**
 * GET — Meta webhook verification challenge
 * A Meta faz uma requisição GET com hub.mode, hub.verify_token e hub.challenge
 * para confirmar que somos os donos do endpoint.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const challenge = verifyMetaWebhookChallenge(params);

  if (challenge) {
    // Responde com o challenge em texto puro (obrigatório pela Meta)
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid verify token" }, { status: 403 });
}

/**
 * POST — Recebe mensagens e status updates da Meta
 */
export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as MetaWebhookPayload;

    // A Meta envia notificações de status (lido, entregue) — ignoramos
    const messages = extractMetaInboundMessages(payload);

    if (messages.length === 0) {
      // Retorna 200 mesmo sem mensagens de texto (pode ser status update)
      return NextResponse.json({ received: true, processed: 0 });
    }

    const adminClient = createAdminClient();

    let processed = 0;

    for (const message of messages) {
      // 1. Salva a mensagem
      const { error: msgError } = await adminClient.from("wa_messages").insert({
        wa_phone: message.phone,
        role: "user",
        content: message.text,
      });

      if (msgError) {
        console.error("wa_messages insert error:", msgError.message);
        continue;
      }

      // 2. Upsert da conversa (atualiza updated_at e nome do perfil se disponível)
      const upsertData: Record<string, unknown> = {
        wa_phone: message.phone,
        updated_at: new Date().toISOString(),
      };

      // Salva o nome do perfil WhatsApp se for a primeira vez
      if (message.profileName) {
        upsertData.profile_name = message.profileName;
      }

      const { error: convoError } = await adminClient
        .from("wa_conversations")
        .upsert(upsertData, { onConflict: "wa_phone" });

      if (convoError) {
        console.error("wa_conversations upsert error:", convoError.message);
      }

      // 3. Chama a Claudia para responder automaticamente (em background)
      generateAndSendClaudiaResponse(message.phone, message.profileName, adminClient).catch(
        (err) => console.error("Claudia auto-response error:", err)
      );

      processed++;
    }

    return NextResponse.json({ received: true, processed });
  } catch (error) {
    console.error("meta webhook error:", error);
    // A Meta requer 200 mesmo em erros — caso contrário reintenta
    return NextResponse.json({ received: true, error: String(error) }, { status: 200 });
  }
}
