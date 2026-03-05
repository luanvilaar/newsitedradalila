/**
 * GET /api/admin/google-calendar/callback
 *
 * Callback do OAuth do Google Calendar.
 * Recebe o código de autorização, troca por tokens,
 * e exibe o refresh_token para ser salvo no .env.local.
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: `Autorização negada: ${error}` },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Código de autorização não recebido" },
      { status: 400 }
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    // Exibe o refresh_token e instruções
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Google Calendar - Autorizado</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
          .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          h1 { color: #16a34a; }
          .token { background: #f0f0f0; padding: 12px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 13px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin-top: 16px; }
          code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
          .step { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✅ Google Calendar Autorizado!</h1>
          <p>A integração foi autorizada com sucesso. Agora salve o refresh token abaixo no <code>.env.local</code>:</p>

          <h3>Refresh Token:</h3>
          <div class="token">${tokens.refresh_token || "⚠️ Nenhum refresh_token retornado. Tente revogar acesso em myaccount.google.com e autorizar novamente."}</div>

          <h3>Passos:</h3>
          <div class="step">1. Abra o arquivo <code>.env.local</code></div>
          <div class="step">2. Adicione: <code>GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token || "SEU_TOKEN_AQUI"}</code></div>
          <div class="step">3. Adicione o ID do calendário: <code>GOOGLE_CALENDAR_ID=seuemail@gmail.com</code></div>
          <div class="step">4. Reinicie o servidor dev</div>

          <div class="warning">
            <strong>⚠️ Importante:</strong> Nunca compartilhe o refresh token. Ele dá acesso ao calendário da Dra. Dalila.
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("Erro ao trocar código OAuth:", err);
    return NextResponse.json(
      {
        error: "Erro ao obter tokens",
        details: err instanceof Error ? err.message : String(err),
        help: "Verifique se GOOGLE_OAUTH_CLIENT_ID e GOOGLE_OAUTH_CLIENT_SECRET estão corretos. O Client ID deve ter formato 'xxxxx.apps.googleusercontent.com'.",
      },
      { status: 500 }
    );
  }
}
