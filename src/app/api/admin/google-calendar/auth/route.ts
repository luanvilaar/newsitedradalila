/**
 * GET /api/admin/google-calendar/auth
 *
 * Gera a URL de autorização OAuth para o Google Calendar.
 * O admin acessa esta rota para autorizar o app a acessar o calendário da dra.
 *
 * Após autorizar, o Google redireciona para /api/admin/google-calendar/callback
 * com o refresh_token que deve ser salvo no .env.local.
 */

import { NextResponse } from "next/server";
import { generateAuthUrl } from "@/lib/google-calendar";

export async function GET() {
  const url = generateAuthUrl();

  if (!url) {
    return NextResponse.json(
      {
        error: "OAuth não configurado",
        help: "Configure GOOGLE_OAUTH_CLIENT_ID e GOOGLE_OAUTH_CLIENT_SECRET no .env.local",
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(url);
}
