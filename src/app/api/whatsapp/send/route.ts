import { NextRequest, NextResponse } from "next/server";
import { sendText, sendMedia } from "@/lib/whatsapp/uazapi";

export const runtime = "nodejs";

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
      return NextResponse.json(result.data ?? { error: result.error }, {
        status: result.ok ? 200 : result.status,
      });
    }

    if (!body.text) {
      return NextResponse.json({ error: "text or mediaUrl is required" }, { status: 400 });
    }

    const result = await sendText({ phone: body.phone, text: body.text });
    return NextResponse.json(result.data ?? { error: result.error }, {
      status: result.ok ? 200 : result.status,
    });
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
