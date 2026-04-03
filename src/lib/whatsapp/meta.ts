/**
 * Meta WhatsApp Cloud API client
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const META_GRAPH_BASE = "https://graph.facebook.com/v20.0";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MetaSendResult = {
  ok: boolean;
  status: number;
  messageId?: string;
  data?: unknown;
  error?: string;
};

export type MetaInboundMessage = {
  phone: string;
  text: string;
  messageId: string;
  profileName: string | null;
  timestamp: string;
};

// ─── Internal types for Meta payload parsing ──────────────────────────────────

type MetaTextMessage = {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
};

type MetaContact = {
  profile?: { name?: string };
  wa_id?: string;
};

type MetaValue = {
  messaging_product?: string;
  metadata?: { phone_number_id?: string };
  contacts?: MetaContact[];
  messages?: MetaTextMessage[];
};

type MetaChange = {
  value?: MetaValue;
  field?: string;
};

type MetaEntry = {
  id?: string;
  changes?: MetaChange[];
};

export type MetaWebhookPayload = {
  object?: string;
  entry?: MetaEntry[];
};

// ─── Config ──────────────────────────────────────────────────────────────────

export function getMetaConfig() {
  return {
    token: process.env.WHATSAPP_API_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    wabaId: process.env.WHATSAPP_WABA_ID,
  };
}

// ─── Send text message ────────────────────────────────────────────────────────

export async function sendMetaMessage(
  toPhone: string,
  text: string
): Promise<MetaSendResult> {
  const config = getMetaConfig();

  if (!config.token || !config.phoneNumberId) {
    return {
      ok: false,
      status: 400,
      error: "WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured",
    };
  }

  // Normalize phone: remove non-digits, ensure country code
  const phone = toPhone.replace(/\D/g, "");

  const url = `${META_GRAPH_BASE}/${config.phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phone,
    type: "text",
    text: { preview_url: false, body: text },
  };

  try {
    const response = await fetch(url, {
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

    const dataObj = data as Record<string, unknown> | null;
    const messages = dataObj?.messages as Array<{ id: string }> | undefined;
    const messageId = messages?.[0]?.id;

    return {
      ok: response.ok,
      status: response.status,
      messageId,
      data,
      error: response.ok ? undefined : `Meta API error (${response.status}): ${JSON.stringify(data)}`,
    };
  } catch (err) {
    return {
      ok: false,
      status: 500,
      error: `Network error: ${String(err)}`,
    };
  }
}

// ─── Verify webhook challenge ─────────────────────────────────────────────────

/**
 * Verifies the Meta webhook challenge handshake.
 * Returns the challenge string if valid, null otherwise.
 */
export function verifyMetaWebhookChallenge(params: URLSearchParams): string | null {
  const config = getMetaConfig();
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === config.verifyToken && challenge) {
    return challenge;
  }
  return null;
}

// ─── Parse inbound webhook payload ───────────────────────────────────────────

/**
 * Extracts text messages from a Meta webhook POST payload.
 * Returns an array since a single payload can contain multiple messages.
 */
export function extractMetaInboundMessages(
  payload: MetaWebhookPayload
): MetaInboundMessage[] {
  const results: MetaInboundMessage[] = [];

  if (payload.object !== "whatsapp_business_account") return results;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;

      const value = change.value;
      if (!value?.messages?.length) continue;

      // Build a map of contacts for profile name lookup
      const contactMap: Record<string, string> = {};
      for (const contact of value.contacts ?? []) {
        if (contact.wa_id && contact.profile?.name) {
          contactMap[contact.wa_id] = contact.profile.name;
        }
      }

      for (const msg of value.messages) {
        // Only handle text messages for now
        if (msg.type !== "text" || !msg.text?.body) continue;

        results.push({
          phone: msg.from.replace(/\D/g, ""),
          text: msg.text.body,
          messageId: msg.id,
          profileName: contactMap[msg.from] ?? null,
          timestamp: new Date(Number(msg.timestamp) * 1000).toISOString(),
        });
      }
    }
  }

  return results;
}
