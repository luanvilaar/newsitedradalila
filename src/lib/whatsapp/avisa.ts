const DEFAULT_AVISA_BASE_URL = "https://www.avisaapi.com.br/api";

type SendAvisaMessageInput = {
  phone: string;
  text: string;
};

type AvisaSendResult = {
  ok: boolean;
  status: number;
  data?: unknown;
  error?: string;
};

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function getAvisaConfig() {
  return {
    baseUrl: getEnv("AVISA_API_BASE_URL") || DEFAULT_AVISA_BASE_URL,
    sendPath: getEnv("AVISA_API_SEND_PATH") || "/actions/sendMessage",
    token: getEnv("AVISA_API_TOKEN"),
    instanceId: getEnv("AVISA_API_INSTANCE_ID"),
  };
}

export async function sendMessageViaAvisa(
  input: SendAvisaMessageInput
): Promise<AvisaSendResult> {
  const config = getAvisaConfig();

  if (!config.token) {
    return {
      ok: false,
      status: 400,
      error: "AVISA_API_TOKEN not configured",
    };
  }

  const endpoint = `${config.baseUrl.replace(/\/$/, "")}/${config.sendPath.replace(/^\//, "")}`;

  const payload: Record<string, unknown> = {
    number: normalizePhone(input.phone),
    message: input.text,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.token}`,
    },
    body: JSON.stringify(payload),
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
    error: response.ok ? undefined : `Avisa API error (${response.status})`,
  };
}

type AvisaInboundMessage = {
  phone: string;
  text: string;
  source: "user" | "assistant";
};

export function extractInboundMessage(payload: unknown): AvisaInboundMessage | null {
  if (!payload || typeof payload !== "object") return null;

  const body = payload as Record<string, unknown>;
  const nested =
    (body.data && typeof body.data === "object" ? (body.data as Record<string, unknown>) : null) ||
    (body.message && typeof body.message === "object"
      ? (body.message as Record<string, unknown>)
      : null);

  const fromCandidates = [
    body.wa_phone,
    body.phone,
    body.from,
    body.number,
    nested?.wa_phone,
    nested?.phone,
    nested?.from,
    nested?.number,
  ];

  const textCandidates = [
    body.content,
    body.text,
    body.message,
    nested?.content,
    nested?.text,
    nested?.message,
  ];

  const roleRaw = String(
    body.role ?? body.direction ?? body.event ?? nested?.role ?? nested?.direction ?? ""
  ).toLowerCase();

  const phone = fromCandidates.find((item) => typeof item === "string" && item.trim()) as
    | string
    | undefined;

  const text = textCandidates.find((item) => typeof item === "string" && item.trim()) as
    | string
    | undefined;

  if (!phone || !text) return null;

  const source: "user" | "assistant" =
    roleRaw.includes("out") || roleRaw.includes("assistant") || roleRaw.includes("agent")
      ? "assistant"
      : "user";

  return {
    phone: normalizePhone(phone),
    text,
    source,
  };
}
