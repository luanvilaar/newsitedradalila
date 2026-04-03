import { NextRequest, NextResponse } from "next/server";
import { getWebhook, setWebhook } from "@/lib/whatsapp/uazapi";

export const runtime = "nodejs";

export async function GET() {
  const result = await getWebhook();
  return NextResponse.json(result.data ?? { error: result.error }, {
    status: result.status,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      url: string;
      enabled: boolean;
      events?: string[];
    };

    const result = await setWebhook(
      body.url,
      body.enabled,
      body.events || ["messages"]
    );

    return NextResponse.json(result.data ?? { error: result.error }, {
      status: result.ok ? 200 : result.status,
    });
  } catch (error) {
    console.error("Webhook config error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
