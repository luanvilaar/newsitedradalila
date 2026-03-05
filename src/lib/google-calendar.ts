/**
 * Google Calendar Service
 *
 * Integração com Google Calendar API para:
 * - Consultar horários disponíveis
 * - Agendar consultas
 * - Cancelar consultas
 *
 * Requer:
 * - GOOGLE_OAUTH_CLIENT_ID (do Google Cloud Console)
 * - GOOGLE_OAUTH_CLIENT_SECRET (do Google Cloud Console)
 * - GOOGLE_OAUTH_REFRESH_TOKEN (obtido via fluxo OAuth)
 * - GOOGLE_CALENDAR_ID (email do calendário, ex: seuemail@gmail.com)
 */

import { google, calendar_v3 } from "googleapis";

// ── Configuração ──────────────────────────────────────────────────────────────

function getOAuthClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/admin/google-calendar/callback`;

  if (!clientId || !clientSecret) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (refreshToken) {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
  }

  return oauth2Client;
}

function getCalendarClient(): calendar_v3.Calendar | null {
  const auth = getOAuthClient();
  if (!auth || !process.env.GOOGLE_OAUTH_REFRESH_TOKEN) {
    return null;
  }
  return google.calendar({ version: "v3", auth });
}

function getCalendarId(): string {
  return process.env.GOOGLE_CALENDAR_ID || "primary";
}

// ── Gerar URL de autorização OAuth ────────────────────────────────────────────

export function generateAuthUrl(): string | null {
  const auth = getOAuthClient();
  if (!auth) return null;

  return auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });
}

// ── Trocar código por tokens ──────────────────────────────────────────────────

export async function exchangeCodeForTokens(code: string) {
  const auth = getOAuthClient();
  if (!auth) throw new Error("OAuth não configurado");

  const { tokens } = await auth.getToken(code);
  return tokens;
}

// ── Verificar se integração está ativa ────────────────────────────────────────

export function isCalendarIntegrationActive(): boolean {
  return !!(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN &&
    process.env.GOOGLE_CALENDAR_ID
  );
}

// ── Buscar horários disponíveis ───────────────────────────────────────────────

export interface AvailableSlot {
  date: string;       // "2026-03-10"
  time: string;       // "14:00"
  datetime: string;   // ISO string completo
  dayOfWeek: string;  // "segunda-feira"
}

const DAY_NAMES_PT = [
  "domingo", "segunda-feira", "terça-feira", "quarta-feira",
  "quinta-feira", "sexta-feira", "sábado",
];

/**
 * Busca horários disponíveis nos próximos N dias.
 * Verifica os horários de trabalho (8h-18h) e retorna slots de 1h
 * que NÃO estejam ocupados no calendário.
 */
export async function getAvailableSlots(
  daysAhead: number = 14,
  city?: string
): Promise<AvailableSlot[]> {
  const calendar = getCalendarClient();
  if (!calendar) return [];

  const calendarId = getCalendarId();
  const now = new Date();
  const timeMin = new Date(now);
  timeMin.setHours(0, 0, 0, 0);
  timeMin.setDate(timeMin.getDate() + 1); // A partir de amanhã

  const timeMax = new Date(timeMin);
  timeMax.setDate(timeMax.getDate() + daysAhead);

  try {
    // Buscar eventos existentes (ocupados)
    const eventsResponse = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const busyTimes = (eventsResponse.data.items || [])
      .filter((event) => event.start?.dateTime && event.end?.dateTime)
      .map((event) => ({
        start: new Date(event.start!.dateTime!),
        end: new Date(event.end!.dateTime!),
      }));

    // Gerar slots disponíveis (seg-sex, 8h-17h, intervalos de 1h)
    const slots: AvailableSlot[] = [];
    const workStart = 8;  // 8:00
    const workEnd = 17;   // 17:00 (último slot às 17h)

    for (let d = 0; d < daysAhead; d++) {
      const day = new Date(timeMin);
      day.setDate(day.getDate() + d);

      // Pular fins de semana
      const dayOfWeek = day.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      for (let hour = workStart; hour <= workEnd; hour++) {
        const slotStart = new Date(day);
        slotStart.setHours(hour, 0, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        // Verificar se o slot NÃO está ocupado
        const isOccupied = busyTimes.some(
          (busy) => busy.start < slotEnd && busy.end > slotStart
        );

        if (!isOccupied) {
          const dateStr = slotStart.toISOString().split("T")[0];
          const timeStr = `${String(hour).padStart(2, "0")}:00`;

          slots.push({
            date: dateStr,
            time: timeStr,
            datetime: slotStart.toISOString(),
            dayOfWeek: DAY_NAMES_PT[dayOfWeek],
          });
        }
      }
    }

    return slots;
  } catch (error) {
    console.error("Erro ao buscar slots do Google Calendar:", error);
    return [];
  }
}

// ── Agendar consulta ──────────────────────────────────────────────────────────

export interface BookingRequest {
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  datetime: string;      // ISO string do horário escolhido
  city?: string;         // João Pessoa ou Recife
  serviceType?: string;  // consulta, retorno, etc.
  notes?: string;
}

export interface BookingResult {
  success: boolean;
  eventId?: string;
  htmlLink?: string;
  error?: string;
}

export async function bookAppointment(booking: BookingRequest): Promise<BookingResult> {
  const calendar = getCalendarClient();
  if (!calendar) {
    return { success: false, error: "Integração com Google Calendar não configurada" };
  }

  const calendarId = getCalendarId();
  const startTime = new Date(booking.datetime);
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 1); // Consulta de 1h

  const description = [
    `Paciente: ${booking.patientName}`,
    booking.patientPhone ? `Telefone: ${booking.patientPhone}` : null,
    booking.patientEmail ? `Email: ${booking.patientEmail}` : null,
    booking.city ? `Cidade: ${booking.city}` : null,
    booking.serviceType ? `Tipo: ${booking.serviceType}` : null,
    booking.notes ? `Observações: ${booking.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `Consulta - ${booking.patientName}`,
        description,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "America/Recife",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "America/Recife",
        },
        attendees: booking.patientEmail
          ? [{ email: booking.patientEmail }]
          : undefined,
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 },
          ],
        },
        location: booking.city
          ? `${booking.city} - Consultório Dra. Dalila Lucena`
          : undefined,
      },
    });

    return {
      success: true,
      eventId: event.data.id || undefined,
      htmlLink: event.data.htmlLink || undefined,
    };
  } catch (error) {
    console.error("Erro ao agendar no Google Calendar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar evento",
    };
  }
}

// ── Cancelar consulta ─────────────────────────────────────────────────────────

export interface CancelResult {
  success: boolean;
  error?: string;
}

export async function cancelAppointment(eventId: string): Promise<CancelResult> {
  const calendar = getCalendarClient();
  if (!calendar) {
    return { success: false, error: "Integração com Google Calendar não configurada" };
  }

  const calendarId = getCalendarId();

  try {
    await calendar.events.delete({
      calendarId,
      eventId,
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar no Google Calendar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao cancelar evento",
    };
  }
}

// ── Buscar consulta por nome do paciente ──────────────────────────────────────

export async function findAppointmentsByPatient(
  patientName: string
): Promise<calendar_v3.Schema$Event[]> {
  const calendar = getCalendarClient();
  if (!calendar) return [];

  const calendarId = getCalendarId();
  const now = new Date();

  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      q: patientName,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 10,
    });

    return response.data.items || [];
  } catch (error) {
    console.error("Erro ao buscar consultas do paciente:", error);
    return [];
  }
}
