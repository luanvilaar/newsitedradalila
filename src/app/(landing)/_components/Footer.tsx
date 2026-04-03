import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t-2 border-accent-gold/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Image
              src="/logo-stacked.png"
              alt="Dra. Dalila Lucena"
              width={160}
              height={80}
              className="h-16 w-auto mb-3"
            />
            <p className="text-xs text-text-muted mb-1">CRM 15295</p>
            <p className="text-sm text-text-secondary mt-3">
              Medicina de Performance e Longevidade
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-text-primary mb-4 text-sm">
              Navegação
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-text-secondary hover:text-accent-gold hover:underline transition-all duration-300"
                >
                  Área do Paciente
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-protecao-de-dados"
                  className="text-sm text-text-secondary hover:text-accent-gold hover:underline transition-all duration-300"
                >
                  Política de Proteção de Dados
                </Link>
              </li>
              <li>
                <a
                  href="#especialidades"
                  className="text-sm text-text-secondary hover:text-accent-gold hover:underline transition-all duration-300"
                >
                  Especialidades
                </a>
              </li>
              <li>
                <a
                  href="#locais"
                  className="text-sm text-text-secondary hover:text-accent-gold hover:underline transition-all duration-300"
                >
                  Locais de Atendimento
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-text-primary mb-4 text-sm">
              Contato
            </h4>
            <ul className="space-y-2">
              <li className="text-sm text-text-secondary">
                João Pessoa, PB
              </li>
              <li className="text-sm text-text-secondary">Recife, PE</li>
              <li className="mt-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-gold transition-colors"
                >
                  <Instagram size={16} />
                  <span>@dalilalucena</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border-light pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Dra. Dalila Lucena. Todos os
            direitos reservados.
          </p>
          <p className="text-xs text-text-muted">
            Responsável técnico: Dra. Dalila Lucena — CRM 15295
          </p>
        </div>
      </div>
    </footer>
  );
}
