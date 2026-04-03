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

    try {
      const supabase = createClient();

      // Sign in with email and password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Email ou senha incorretos.");
        setLoading(false);
        return;
      }

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Erro ao obter dados do usuário.");
        setLoading(false);
        return;
      }

      // Get user profile with role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);

        // Profile doesn't exist - try to create it
        if (profileError.code === "PGRST116") {
          try {
            // Call sync-profile endpoint to create missing profile
            const syncResponse = await fetch("/api/auth/sync-profile", {
              method: "POST",
            });

            if (syncResponse.ok) {
              // Profile created successfully, try to proceed
              const syncData = await syncResponse.json();
              console.log("Profile synced:", syncData);

              // Retry fetching the profile
              const { data: newProfile, error: retryError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

              if (retryError) {
                setError(
                  "Perfil não encontrado. Entre em contato com o suporte."
                );
                setLoading(false);
                return;
              }

              // Use the newly created profile
              if (newProfile?.role === "admin") {
                router.refresh();
                router.replace("/admin");
              } else {
                router.refresh();
                router.replace("/paciente");
              }
              return;
            }
          } catch (syncErr) {
            console.error("Sync profile failed:", syncErr);
          }
        }

        setError("Erro ao carregar perfil do usuário.");
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (profile?.role === "admin") {
        // Force a refresh to ensure session is established
        router.refresh();
        // Use replace to avoid back button issues
        router.replace("/admin");
      } else if (profile?.role === "patient") {
        router.refresh();
        router.replace("/paciente");
      } else {
        setError("Tipo de usuário não reconhecido.");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
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
