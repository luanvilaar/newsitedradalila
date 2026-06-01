import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Função utilitária para verificar se o usuário é administrador
async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "admin";
}

// GET: Recupera a configuração do Link Tree e os links cadastrados
export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Obter a configuração do perfil
    let { data: config, error: configError } = await supabase
      .from("linktree_config")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (configError) {
      console.error("Erro ao carregar linktree_config:", configError);
    }

    // Se não existir nenhuma configuração salva, fornecer a de fallback
    if (!config) {
      config = {
        title: "Dra. Dalila Lucena",
        subtitle: "Medicina de Performance & Longevidade",
        bio: "Ciência, precisão e performance aplicadas para transformar sua saúde e alcançar sua melhor versão.",
        avatar_url: "/perfil-links.png",
        instagram_url: "https://www.instagram.com/dalilalucena",
        whatsapp_url: "https://wa.me/5583988118436?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20em%20Jo%C3%A3o%20Pessoa.",
        video_url: "https://assets.mixkit.co/videos/preview/mixkit-medical-research-in-a-laboratory-40081-large.mp4",
        video_redirect_url: "https://www.instagram.com/p/DYnJV9XJcQS/",
        show_video: true
      };
    }

    // 2. Obter a lista de links
    const { data: links, error: linksError } = await supabase
      .from("linktree_links")
      .select("*")
      .order("position_order", { ascending: true });

    if (linksError) {
      console.error("Erro ao carregar linktree_links:", linksError);
    }

    return NextResponse.json({
      config,
      links: links || []
    });
  } catch (error) {
    console.error("Erro interno no GET de links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Gerencia ações de escrita no painel administrativo
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Validar Autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Validar se o usuário é administrador (médica)
    const admin = await isAdmin(supabase, user.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    // Parse do Body
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Missing action in request body" },
        { status: 400 }
      );
    }

    // --- AÇÃO 1: Salvar Configurações Globais ---
    if (action === "save_config") {
      const { title, subtitle, bio, avatar_url, instagram_url, whatsapp_url, video_url, video_redirect_url, show_video } = body.config;

      // Tenta obter o ID do primeiro registro existente para fazer update
      const { data: existingConfig } = await supabase
        .from("linktree_config")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const configId = existingConfig?.id || "a3e20000-0000-0000-0000-000000000001";

      const { data, error } = await supabase
        .from("linktree_config")
        .upsert({
          id: configId,
          title: title || "Dra. Dalila Lucena",
          subtitle: subtitle || "Medicina de Performance & Longevidade",
          bio: bio || "",
          avatar_url: avatar_url || "/perfil-links.png",
          instagram_url: instagram_url || "",
          whatsapp_url: whatsapp_url || "",
          video_url: video_url || "",
          video_redirect_url: video_redirect_url || "https://www.instagram.com/p/DYnJV9XJcQS/",
          show_video: show_video !== undefined ? !!show_video : true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar config do linktree:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, config: data });
    }

    // --- AÇÃO 2: Salvar ou Editar um Link Individual ---
    if (action === "save_link") {
      const { id, title, subtitle, url, icon_name, is_primary, position_order, is_active } = body.link;

      if (!title || !url) {
        return NextResponse.json(
          { error: "Title and URL are required" },
          { status: 400 }
        );
      }

      const linkData = {
        title,
        subtitle: subtitle || "",
        url,
        icon_name: icon_name || "external-link",
        is_primary: !!is_primary,
        position_order: position_order !== undefined ? position_order : 0,
        is_active: is_active !== undefined ? !!is_active : true
      };

      let error;
      let result;

      if (id) {
        // Modo de Edição
        const { data, error: updateError } = await supabase
          .from("linktree_links")
          .update(linkData)
          .eq("id", id)
          .select()
          .single();
        error = updateError;
        result = data;
      } else {
        // Modo de Criação
        const { data, error: insertError } = await supabase
          .from("linktree_links")
          .insert(linkData)
          .select()
          .single();
        error = insertError;
        result = data;
      }

      if (error) {
        console.error("Erro ao salvar link do linktree:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, link: result });
    }

    // --- AÇÃO 3: Excluir um Link ---
    if (action === "delete_link") {
      const { id } = body;

      if (!id) {
        return NextResponse.json(
          { error: "Missing link ID" },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from("linktree_links")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir link do linktree:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    // --- AÇÃO 4: Reordenar Links ---
    if (action === "reorder_links") {
      const { links } = body; // Array de { id: string, position_order: number }

      if (!links || !Array.isArray(links)) {
        return NextResponse.json(
          { error: "Invalid links array for reordering" },
          { status: 400 }
        );
      }

      // Executa as atualizações de ordem em paralelo
      const updatePromises = links.map((link) =>
        supabase
          .from("linktree_links")
          .update({ position_order: link.position_order })
          .eq("id", link.id)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter((r) => r.error);

      if (errors.length > 0) {
        console.error("Erros ao reordenar links:", errors);
        return NextResponse.json(
          { error: "Erro ao reordenar alguns links" },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro interno no POST de links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
