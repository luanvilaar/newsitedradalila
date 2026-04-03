import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { extractInboundMessage } from "@/lib/whatsapp/avisa";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest): boolean {
  let secret = process.env.AVISA_WEBHOOK_SECRET;

  if (!secret) {
    try {
      const candidateDirs = [
        process.cwd(),
        process.env.PWD,
        process.env.INIT_CWD,
        process.env.HOME
          ? join(process.env.HOME, "Desktop", "Projetos", "DT")
          : undefined,
      ].filter((item): item is string => Boolean(item));

      for (const baseDir of candidateDirs) {
        const envPath = join(baseDir, ".env.local");
        if (!existsSync(envPath)) continue;

        const envContent = readFileSync(envPath, "utf8");
        const line = envContent
          .split("\n")
          .find((item) => item.trim().startsWith("AVISA_WEBHOOK_SECRET="));

        if (!line) continue;
        const value = line.split("=").slice(1).join("=").trim();
        if (value) {
          secret = value;
          break;
        }
      }
    } catch {
      secret = undefined;
    }
  }

  if (!secret) return true;

  const provided =
    req.headers.get("x-webhook-secret") ||
    req.headers.get("x-api-key") ||
    req.nextUrl.searchParams.get("secret");

  return provided === secret;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
    }

    const payload = (await req.json()) as unknown;
    const message = extractInboundMessage(payload);

    if (!message) {
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
