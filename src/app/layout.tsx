import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

// Tipografia premium: Playfair Display (títulos/elegante) + Montserrat (corpo)
const playfair = Playfair_Display({
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dra. Dalila Lucena | Medicina de Performance e Longevidade",
  description:
    "Especialista em Obesidade, Performance, Reposição Hormonal e Implantes Hormonais. Atendimento em João Pessoa e Recife. CRM 15295.",
  keywords: [
    "medicina",
    "performance",
    "obesidade",
    "reposição hormonal",
    "implantes hormonais",
    "João Pessoa",
    "Recife",
    "Dalila Lucena",
  ],
  openGraph: {
    title: "Dra. Dalila Lucena | Medicina de Performance e Longevidade",
    description:
      "Ciência, precisão e performance aplicadas à sua melhor versão.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body
        className={`${playfair.variable} ${montserrat.variable} antialiased overflow-x-hidden max-w-[100vw] text-foreground bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
