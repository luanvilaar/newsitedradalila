/**
 * Rate Limiter simples baseado em memória (in-process).
 * Adequado para instâncias únicas (single-instance).
 * Para múltiplas instâncias (cluster/serverless), substitua por Redis/KV.
 */

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

/** Limpa entradas expiradas a cada 5 minutos para evitar leak de memória */
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.resetAt <= now) {
            store.delete(key);
        }
    }
}, 5 * 60 * 1000);

export type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    resetIn: number; // segundos
};

/**
 * Verifica se o identificador (IP, userId, etc.) ainda está dentro do limite.
 * @param key - chave única (ex: `chat:${ip}`)
 * @param limit - número máximo de requisições
 * @param windowSeconds - janela de tempo em segundos
 */
export function checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number
): RateLimitResult {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
        // Janela nova
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1, resetIn: windowSeconds };
    }

    if (entry.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: Math.ceil((entry.resetAt - now) / 1000),
        };
    }

    entry.count++;
    store.set(key, entry);

    return {
        allowed: true,
        remaining: limit - entry.count,
        resetIn: Math.ceil((entry.resetAt - now) / 1000),
    };
}
