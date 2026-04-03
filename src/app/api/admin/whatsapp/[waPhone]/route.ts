import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

type AdminSupabase = Awaited<ReturnType<typeof createClient>>;

async function isAdmin(supabase: AdminSupabase, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "admin";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ waPhone: string }> }
) {
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

    const { waPhone } = await params;
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("wa_messages")
      .select("id, wa_phone, role, content, created_at")
      .eq("wa_phone", decodeURIComponent(waPhone))
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [] });
  } catch (error) {
    console.error("whatsapp messages error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
