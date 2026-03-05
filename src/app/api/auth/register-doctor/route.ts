import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { validateWebhookSecret } from "@/lib/security/auth-helpers";

/**
 * POST: Cria uma nova conta de médico/admin.
 *
 * SEGURANÇA: Este endpoint REQUER o header `X-Doctor-Creation-Token`
 * com o valor configurado em `DOCTOR_CREATION_SECRET` no .env.local.
 *
 * Isso impede que qualquer pessoa na internet crie uma conta admin
 * sem autorização prévia.
 */
export async function POST(request: Request) {
  try {
    // ──────────────────────────────────────────────────────────────
    // SEGURANÇA: Sempre validar token de criação de médico PRIMEIRO
    // Nunca pular esta verificação independentemente da configuração
    // ──────────────────────────────────────────────────────────────
    const creationToken = request.headers.get("X-Doctor-Creation-Token");
    const creationSecret = process.env.DOCTOR_CREATION_SECRET;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Exige que DOCTOR_CREATION_SECRET sempre esteja configurado
    if (!creationSecret) {
      console.error("[register-doctor] DOCTOR_CREATION_SECRET não configurado.");
      return NextResponse.json(
        {
          error:
            "Endpoint não está configurado corretamente. Configure DOCTOR_CREATION_SECRET no ambiente.",
        },
        { status: 503 }
      );
    }

    // Valida o token recebido (timing-safe para evitar timing attacks)
    if (!validateWebhookSecret(creationToken, creationSecret)) {
      console.warn("[register-doctor] Tentativa não autorizada de criar conta admin.");
      return NextResponse.json(
        { error: "Unauthorized: token de criação inválido ou ausente." },
        { status: 401 }
      );
    }

    // ── Exige service role key para operações administrativas ────────
    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            "SUPABASE_SERVICE_ROLE_KEY não configurada. Necessária para criar contas de médico.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, password, full_name } = body as {
      email?: string;
      password?: string;
      full_name?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // Valida complexidade mínima de senha
    if (password.length < 12) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 12 caracteres." },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    const { data: profileData, error: profileError } = await adminClient
      .from("profiles")
      .insert({
        id: authData.user.id,
        role: "admin",
        full_name: full_name || email.split("@")[0],
      })
      .select()
      .single();

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: `Falha ao criar perfil: ${profileError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Conta médica criada com sucesso.",
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      profile: profileData,
    });
  } catch (error) {
    console.error("Erro ao criar conta de médico:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
