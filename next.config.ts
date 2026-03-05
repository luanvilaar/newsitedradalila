import type { NextConfig } from "next";

const securityHeaders = [
  // Impede clickjacking (iframes não autorizados)
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Impede sniffing de content-type
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Controla informações de referrer enviadas em requisições
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // HSTS: força HTTPS por 1 ano, inclui subdomínios
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // Permissões de features do browser
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Content Security Policy — restringe origens de scripts, estilos e demais recursos
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: apenas próprios e next.js internos
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Estilos: apenas próprios
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fontes
      "font-src 'self' https://fonts.gstatic.com data:",
      // Imagens: próprias + supabase + unsplash (usado em remotePatterns)
      "img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com",
      // Conexões: própria origem + supabase + openai + apis usadas
      "connect-src 'self' https://*.supabase.co https://api.openai.com https://generativelanguage.googleapis.com https://www.avisaapi.com.br https://api.nuvemfiscal.com.br",
      // Frames: nenhum externo permitido
      "frame-ancestors 'none'",
      // Base URI: apenas própria
      "base-uri 'self'",
      // Formulários: apenas própria origem
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ["image/webp", "image/avif"],
    // SEGURANÇA: SVG desabilitado pois pode conter scripts maliciosos
    dangerouslyAllowSVG: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        // Aplica os headers de segurança em todas as rotas
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
