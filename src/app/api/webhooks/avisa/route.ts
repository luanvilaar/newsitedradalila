import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { extractInboundMessage } from "@/lib/whatsapp/avisa";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as unknown;
    console.log("[avisa-webhook] payload received:", JSON.stringify(payload));

    const message = extractInboundMessage(payload);

    if (!message) {
      console.log("[avisa-webhook] Unable to parse payload");
      return NextResponse.json(
        { error: "Unable to parse inbound message payload" },
        { status: 400 }
      );
    }

    console.log("[avisa-webhook] parsed message:", JSON.stringify(message));

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
