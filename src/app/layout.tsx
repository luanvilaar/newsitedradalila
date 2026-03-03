import type { Metadata } from "next";
import { Bebas_Neue, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
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
    <html lang="pt-BR">
      <body
        className={`${bebasNeue.variable} ${cormorant.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
