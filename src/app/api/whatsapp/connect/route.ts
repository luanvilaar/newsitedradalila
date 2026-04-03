import { NextResponse } from "next/server";
import { connectInstance } from "@/lib/whatsapp/uazapi";

export const runtime = "nodejs";

export async function POST() {
  const result = await connectInstance();
  return NextResponse.json(result.data ?? { error: result.error }, {
    status: result.status,
  });
}
