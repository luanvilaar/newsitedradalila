const DEFAULT_UAZAPI_BASE_URL = "https://free.uazapi.com";

type SendTextInput = {
  phone: string;
  text: string;
};

type SendMediaInput = {
  phone: string;
  mediaUrl: string;
  caption?: string;
};

type UazapiResult = {
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

export function getUazapiConfig() {
  return {
    baseUrl: getEnv("UAZAPI_BASE_URL") || DEFAULT_UAZAPI_BASE_URL,
    token: getEnv("UAZAPI_INSTANCE_TOKEN"),
    webhookSecret: getEnv("UAZAPI_WEBHOOK_SECRET"),
  };
}

async function uazapiFetch(
  path: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>
): Promise<UazapiResult> {
  const config = getUazapiConfig();

  if (!config.token) {
    return { ok: false, status: 400, error: "UAZAPI_INSTANCE_TOKEN not configured" };
  }

  const url = `${config.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      token: config.token,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
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
    error: response.ok ? undefined : `UAZAPI error (${response.status})`,
  };
}

// --- Instance ---

export async function getInstanceStatus(): Promise<UazapiResult> {
  return uazapiFetch("instance/status", "GET");
}

export async function connectInstance(): Promise<UazapiResult> {
  return uazapiFetch("instance/connect", "POST");
}

export async function disconnectInstance(): Promise<UazapiResult> {
  return uazapiFetch("instance/disconnect", "POST");
}

// --- Messaging ---

export async function sendText(input: SendTextInput): Promise<UazapiResult> {
  return uazapiFetch("send/text", "POST", {
    number: normalizePhone(input.phone),
    text: input.text,
  });
}

export async function sendMedia(input: SendMediaInput): Promise<UazapiResult> {
  return uazapiFetch("send/media", "POST", {
    number: normalizePhone(input.phone),
    media: input.mediaUrl,
    caption: input.caption || "",
  });
}

export async function sendLocation(
  phone: string,
  latitude: number,
  longitude: number,
  name?: string
): Promise<UazapiResult> {
  return uazapiFetch("send/location", "POST", {
    number: normalizePhone(phone),
    latitude,
    longitude,
    name: name || "",
  });
}

export async function sendContact(
  phone: string,
  contactName: string,
  contactPhone: string
): Promise<UazapiResult> {
  return uazapiFetch("send/contact", "POST", {
    number: normalizePhone(phone),
    contactName,
    contactPhone: normalizePhone(contactPhone),
  });
}

// --- Webhook ---

export async function getWebhook(): Promise<UazapiResult> {
  return uazapiFetch("webhook", "GET");
}

export async function setWebhook(
  url: string,
  enabled: boolean,
  events: string[] = ["messages"]
): Promise<UazapiResult> {
  return uazapiFetch("webhook", "POST", { url, enabled, events });
}

// --- Inbound message parsing ---

type UazapiInboundMessage = {
  phone: string;
  text: string;
  source: "user" | "assistant";
  messageId?: string;
  timestamp?: number;
  pushName?: string;
};

export function extractInboundMessage(payload: unknown): UazapiInboundMessage | null {
  if (!payload || typeof payload !== "object") return null;

  const body = payload as Record<string, unknown>;

  // UAZAPI real webhook format:
  // {
  //   message: { chatid, text, fromMe, senderName, messageid, messageTimestamp, ... },
  //   chat: { phone, wa_chatid, wa_name, ... },
  //   owner: "558399638013",
  //   EventType: "messages"
  // }
  // Also support Baileys format: { event, data: { key: { remoteJid }, message: { conversation } } }

  const msg =
    body.message && typeof body.message === "object"
      ? (body.message as Record<string, unknown>)
      : null;

  const chat =
    body.chat && typeof body.chat === "object"
      ? (body.chat as Record<string, unknown>)
      : null;

  const data =
    body.data && typeof body.data === "object"
      ? (body.data as Record<string, unknown>)
      : null;

  const key =
    data?.key && typeof data.key === "object"
      ? (data.key as Record<string, unknown>)
      : null;

  const dataMsg =
    data?.message && typeof data.message === "object"
      ? (data.message as Record<string, unknown>)
      : null;

  // Extract phone number
  const phoneCandidates = [
    msg?.chatid,
    msg?.sender_pn,
    chat?.wa_chatid,
    chat?.phone,
    key?.remoteJid,
    body.chatid,
    body.from,
    body.number,
    body.phone,
  ];

  let phone = phoneCandidates.find(
    (item) => typeof item === "string" && item.trim()
  ) as string | undefined;

  if (!phone) return null;

  // Ignore group messages
  if (phone.includes("@g.us")) return null;
  phone = phone.replace(/@s\.whatsapp\.net$/, "").replace(/@lid$/, "").replace(/\D/g, "");
  if (!phone) return null;

  // Extract text content
  const textCandidates = [
    msg?.text,
    msg?.content,
    msg?.body,
    dataMsg?.conversation,
    dataMsg?.text,
    body.text,
    body.content,
  ];

  // Also check extendedTextMessage inside data.message (Baileys)
  if (dataMsg?.extendedTextMessage && typeof dataMsg.extendedTextMessage === "object") {
    textCandidates.push((dataMsg.extendedTextMessage as Record<string, unknown>).text);
  }

  const text = textCandidates.find(
    (item) => typeof item === "string" && item.trim()
  ) as string | undefined;

  if (!text) return null;

  // Determine direction
  const fromMe =
    msg?.fromMe === true ||
    key?.fromMe === true ||
    body.fromMe === true;

  const source: "user" | "assistant" = fromMe ? "assistant" : "user";

  return {
    phone,
    text,
    source,
    messageId:
      (typeof msg?.messageid === "string" ? msg.messageid : undefined) ||
      (typeof key?.id === "string" ? key.id : undefined),
    timestamp:
      typeof msg?.messageTimestamp === "number" ? msg.messageTimestamp :
      typeof body.messageTimestamp === "number" ? (body.messageTimestamp as number) : undefined,
    pushName:
      (typeof msg?.senderName === "string" ? msg.senderName : undefined) ||
      (typeof chat?.wa_name === "string" ? chat.wa_name : undefined),
  };
}
