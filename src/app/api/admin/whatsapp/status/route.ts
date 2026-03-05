import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type AdminSupabase = Awaited<ReturnType<typeof createClient>>;

async function isAdmin(supabase: AdminSupabase, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "admin";
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdmin(supabase, user.id);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const token = process.env.AVISA_API_TOKEN;
    if (!token) {
      return NextResponse.json({
        connected: false,
        error: "AVISA_API_TOKEN not configured",
      });
    }

    const baseUrl = process.env.AVISA_API_BASE_URL || "https://www.avisaapi.com.br/api";

    const res = await fetch(`${baseUrl}/instance/status`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({
        connected: false,
        error: `Avisa API returned ${res.status}`,
      });
    }

    const data = (await res.json()) as {
      status?: boolean;
      data?: {
        code?: number;
        data?: {
          Connected?: boolean;
          LoggedIn?: boolean;
          Jid?: string;
          Events?: string;
        };
        success?: boolean;
      };
    };

    const instanceData = data?.data?.data;

    return NextResponse.json({
      connected: instanceData?.Connected === true && instanceData?.LoggedIn === true,
      jid: instanceData?.Jid || null,
      events: instanceData?.Events || null,
    });
  } catch (error) {
    console.error("whatsapp status error", error);
    return NextResponse.json({
      connected: false,
      error: "Failed to check instance status",
    });
  }
}
