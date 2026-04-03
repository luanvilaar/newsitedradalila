import { NextResponse } from "next/server";
import { getInstanceStatus } from "@/lib/whatsapp/uazapi";

export const runtime = "nodejs";

export async function GET() {
  const result = await getInstanceStatus();
  return NextResponse.json(result.data ?? { error: result.error }, {
    status: result.status,
  });
}
