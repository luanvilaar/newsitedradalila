import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { sendMessageViaAvisa } from "@/lib/whatsapp/avisa";

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

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("wa_conversations")
      .select("wa_phone, memory_summary, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const phones = (data || []).map((item) => item.wa_phone);

    let lastMessages: Record<string, { content: string; created_at: string; role: string }> = {};
    if (phones.length > 0) {
      const { data: messagesData } = await adminClient
        .from("wa_messages")
        .select("wa_phone, content, role, created_at")
        .in("wa_phone", phones)
        .order("created_at", { ascending: false });

      (messagesData || []).forEach((msg) => {
        if (!lastMessages[msg.wa_phone]) {
          lastMessages[msg.wa_phone] = {
            content: msg.content,
            created_at: msg.created_at,
            role: msg.role,
          };
        }
      });
    }

    const conversations = (data || []).map((item) => ({
      wa_phone: item.wa_phone,
      memory_summary: item.memory_summary,
      updated_at: item.updated_at,
      last_message: lastMessages[item.wa_phone]?.content || "",
      last_message_role: lastMessages[item.wa_phone]?.role || null,
      last_message_at: lastMessages[item.wa_phone]?.created_at || item.updated_at,
    }));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("whatsapp conversations error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const { wa_phone, content } = (await req.json()) as {
      wa_phone?: string;
      content?: string;
    };

    if (!wa_phone || !content?.trim()) {
      return NextResponse.json({ error: "wa_phone and content are required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const avisaResult = await sendMessageViaAvisa({
      phone: wa_phone,
      text: content.trim(),
    });

    const { error: insertError } = await adminClient.from("wa_messages").insert({
      wa_phone,
      role: "assistant",
      content: content.trim(),
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { error: convoError } = await adminClient.from("wa_conversations").upsert(
      {
        wa_phone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "wa_phone" }
    );

    if (convoError) {
      return NextResponse.json({ error: convoError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      provider: {
        name: "avisaapi",
        ok: avisaResult.ok,
        status: avisaResult.status,
        error: avisaResult.error,
      },
    });
  } catch (error) {
    console.error("whatsapp send error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
