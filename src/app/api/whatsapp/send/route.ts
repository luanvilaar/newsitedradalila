import { NextRequest, NextResponse } from "next/server";
import { sendText, sendMedia } from "@/lib/whatsapp/uazapi";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

async function saveOutboundMessage(phone: string, text: string) {
  try {
    const adminClient = createAdminClient();
    const waPhone = normalizePhone(phone);

    await adminClient.from("wa_messages").insert({
      wa_phone: waPhone,
      role: "assistant",
      content: text,
    });

    await adminClient.from("wa_conversations").upsert(
      { wa_phone: waPhone, updated_at: new Date().toISOString() },
      { onConflict: "wa_phone" }
    );
  } catch (error) {
    console.error("Error saving outbound message:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      phone: string;
      text?: string;
      mediaUrl?: string;
      caption?: string;
    };

    if (!body.phone) {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    if (body.mediaUrl) {
      const result = await sendMedia({
        phone: body.phone,
        mediaUrl: body.mediaUrl,
        caption: body.caption,
      });
      if (result.ok) {
        await saveOutboundMessage(body.phone, body.caption || "[mídia]");
      }
      return NextResponse.json(result.data ?? { error: result.error }, {
        status: result.ok ? 200 : result.status,
      });
    }

    if (!body.text) {
      return NextResponse.json({ error: "text or mediaUrl is required" }, { status: 400 });
    }

    const result = await sendText({ phone: body.phone, text: body.text });
    if (result.ok) {
      await saveOutboundMessage(body.phone, body.text);
    }
    return NextResponse.json(result.data ?? { error: result.error }, {
      status: result.ok ? 200 : result.status,
    });
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
