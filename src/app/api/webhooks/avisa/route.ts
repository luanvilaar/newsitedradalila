import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { extractInboundMessage } from "@/lib/whatsapp/avisa";
import { validateWebhookSecret } from "@/lib/security/auth-helpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // ────────────────────────────────────────────────────────────
  // SEGURANÇA: Validar secret do webhook antes de qualquer ação
  // Configure AVISA_WEBHOOK_SECRET no .env.local
  // ────────────────────────────────────────────────────────────
  const receivedSecret =
    req.headers.get("x-webhook-secret") ||
    req.headers.get("x-avisa-secret") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  const expectedSecret = process.env.AVISA_WEBHOOK_SECRET;

  if (!expectedSecret) {
    // Se o secret não está configurado, rejeitar em produção
    console.error("[avisa-webhook] AVISA_WEBHOOK_SECRET não configurado. Rejeitando requisição.");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  if (!validateWebhookSecret(receivedSecret, expectedSecret)) {
    console.warn("[avisa-webhook] Tentativa não autorizada: secret inválido ou ausente");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const payload = (await req.json()) as unknown;

    const message = extractInboundMessage(payload);

    if (!message) {
      console.log("[avisa-webhook] Unable to parse payload");
      return NextResponse.json(
        { error: "Unable to parse inbound message payload" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    const { error: messageError } = await adminClient.from("wa_messages").insert({
      wa_phone: message.phone,
      role: message.source,
      content: message.text,
    });

    if (messageError) {
      return NextResponse.json({ error: messageError.message }, { status: 500 });
    }

    const { error: conversationError } = await adminClient.from("wa_conversations").upsert(
      {
        wa_phone: message.phone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "wa_phone" }
    );

    if (conversationError) {
      return NextResponse.json({ error: conversationError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("avisa webhook error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
