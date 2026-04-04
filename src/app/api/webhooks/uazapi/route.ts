import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { extractInboundMessage, getUazapiConfig } from "@/lib/whatsapp/uazapi";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest): boolean {
  const { webhookSecret } = getUazapiConfig();

  // If no secret configured, allow all (development mode)
  if (!webhookSecret) return true;

  const provided =
    req.headers.get("x-webhook-secret") ||
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.nextUrl.searchParams.get("secret");

  return provided === webhookSecret;
}

export async function POST(req: NextRequest) {
  console.log(`📥 Webhook UAZAPI recebido: ${req.method} em ${req.nextUrl.pathname}`);
  try {
    if (!isAuthorized(req)) {
      console.warn("⚠️ Webhook UAZAPI: Não autorizado (Secret mismatch)");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await req.json()) as unknown;
    console.log("UAZAPI webhook payload:", JSON.stringify(payload));

    const message = extractInboundMessage(payload);

    if (!message) {
      console.log("UAZAPI webhook: could not extract message from payload");
      return NextResponse.json({ ignored: true });
    }

    console.log("UAZAPI webhook: extracted message:", JSON.stringify(message));

    const adminClient = createAdminClient();

    // Save message
    const { error: messageError } = await adminClient.from("wa_messages").insert({
      wa_phone: message.phone,
      role: message.source,
      content: message.text,
    });

    if (messageError) {
      console.error("Error saving wa_message:", messageError);
      return NextResponse.json({ error: messageError.message }, { status: 500 });
    }

    // Upsert conversation
    const { error: conversationError } = await adminClient.from("wa_conversations").upsert(
      {
        wa_phone: message.phone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "wa_phone" }
    );

    if (conversationError) {
      console.error("Error upserting wa_conversation:", conversationError);
      return NextResponse.json({ error: conversationError.message }, { status: 500 });
    }

    // Update patient profile with pushName if available
    if (message.pushName) {
      await adminClient.from("wa_patient_profile").upsert(
        {
          wa_phone: message.phone,
          patient_name: message.pushName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "wa_phone", ignoreDuplicates: false }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UAZAPI webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
