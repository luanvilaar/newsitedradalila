"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/api/auth/callback` }
    );

    if (resetError) {
      setError("Erro ao enviar email. Tente novamente.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-elevated)] p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--success)"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Email enviado!
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          Verifique sua caixa de entrada para redefinir sua senha.
        </p>
        <Link
          href="/login"
          className="text-sm text-accent-gold hover:text-accent-gold-dark transition-colors"
        >
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-elevated)] p-8">
      <div className="text-center mb-8">
        <h1 className="font-heading text-4xl tracking-wide text-accent-dark">
          DALILA LUCENA
        </h1>
        <p className="text-text-muted text-sm mt-2">Recuperar senha</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-error text-center">{error}</p>
        )}

        <Button
          type="submit"
          variant="premium"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar link de recuperação"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-text-secondary hover:text-accent-gold transition-colors"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
