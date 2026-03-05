import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Lista de caminhos internos permitidos no parâmetro 'next'
const ALLOWED_NEXT_PATHS = ["/admin", "/paciente", "/"];

/**
 * Valida que o parâmetro 'next' é um caminho interno seguro.
 * Protege contra open redirect attacks.
 */
function safeNextPath(next: string | null, origin: string): string {
  if (!next) return "/";

  try {
    // Tenta construir URL absoluta para detectar redirecionamentos externos
    const url = new URL(next, origin);

    // Rejeita se apontar para outro domínio
    if (url.origin !== origin) return "/";

    // Verifica se começa com algum dos caminhos permitidos
    const path = url.pathname;
    const isAllowed = ALLOWED_NEXT_PATHS.some((allowed) =>
      path.startsWith(allowed)
    );

    return isAllowed ? path : "/";
  } catch {
    return "/";
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // Redireciona com base no role — ignora parâmetro 'next' para usuários autenticados
        // pois o role define o destino correto
        if (profile?.role === "admin") {
          return NextResponse.redirect(`${origin}/admin`);
        }
        return NextResponse.redirect(`${origin}/paciente`);
      }

      // Para casos sem user (ex: magic link sem perfil), usa 'next' validado
      const safePath = safeNextPath(next, origin);
      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
