import { NextResponse } from "next/server";
import { disconnectInstance } from "@/lib/whatsapp/uazapi";

export const runtime = "nodejs";

export async function POST() {
  const result = await disconnectInstance();
  return NextResponse.json(result.data ?? { error: result.error }, {
    status: result.status,
  });
}
