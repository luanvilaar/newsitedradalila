/**
 * Utilitários centrais de autenticação e autorização.
 * Use sempre estas funções – nunca reimplemente isAdmin localmente.
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export type AuthResult =
    | { ok: true; userId: string; supabase: Awaited<ReturnType<typeof createClient>> }
    | { ok: false; response: NextResponse };

/**
 * Valida o token de sessão do usuário.
 * Retorna o userId e instância do supabase se autenticado,
 * ou a resposta de erro 401 pronta para retornar.
 */
export async function requireAuth(): Promise<AuthResult> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }

    return { ok: true, userId: user.id, supabase };
}

/**
 * Valida que o usuário autenticado possui role "admin".
 * Retorna 401 se não autenticado, 403 se não for admin.
 */
export async function requireAdmin(): Promise<AuthResult> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    // Em caso de erro ao buscar perfil, NEGAR acesso (fail-closed)
    if (error || !profile || profile.role !== "admin") {
        return {
            ok: false,
            response: NextResponse.json(
                { error: "Forbidden: Admin only" },
                { status: 403 }
            ),
        };
    }

    return { ok: true, userId: user.id, supabase };
}

/**
 * Valida que o usuário autenticado possui role "patient".
 * Retorna 401 se não autenticado, 403 se não for paciente.
 */
export async function requirePatient(): Promise<AuthResult> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (error || !profile || profile.role !== "patient") {
        return {
            ok: false,
            response: NextResponse.json(
                { error: "Forbidden: Patient only" },
                { status: 403 }
            ),
        };
    }

    return { ok: true, userId: user.id, supabase };
}

/**
 * Valida o secret de webhook.
 * Compara de forma segura (timing-safe) para evitar timing attacks.
 * Retorna true se válido, false caso contrário.
 */
export function validateWebhookSecret(
    receivedSecret: string | null | undefined,
    expectedSecret: string | undefined
): boolean {
    if (!receivedSecret || !expectedSecret) return false;

    // Comparação de comprimento antes (evita timing attack básico)
    if (receivedSecret.length !== expectedSecret.length) return false;

    // Comparação caractere a caractere acumulando resultado (timing-safe simples)
    let mismatch = 0;
    for (let i = 0; i < expectedSecret.length; i++) {
        mismatch |= receivedSecret.charCodeAt(i) ^ expectedSecret.charCodeAt(i);
    }
    return mismatch === 0;
}
