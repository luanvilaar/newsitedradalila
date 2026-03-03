"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ou senha incorretos.");
      setLoading(false);
      return;
    }

    // Get user role to redirect
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/paciente");
      }
    }

    router.refresh();
  }

  return (
    <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-elevated)] p-8">
      <div className="text-center mb-8">
        <h1 className="font-heading text-4xl tracking-wide text-accent-dark">
          DALILA LUCENA
        </h1>
        <p className="text-text-muted text-sm mt-2">Acesse sua conta</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          id="password"
          label="Senha"
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/recuperar-senha"
          className="text-sm text-text-secondary hover:text-accent-gold transition-colors"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-border-light text-center">
        <Link
          href="/"
          className="text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Voltar ao site
        </Link>
      </div>
    </div>
  );
}
