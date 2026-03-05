import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  bookAppointment,
  isCalendarIntegrationActive,
  BookingRequest,
} from "@/lib/google-calendar";

/**
 * POST /api/calendar/book
 *
 * Agenda uma consulta no Google Calendar da Dra. Dalila.
 *
 * Body:
 * {
 *   "patientName": "Maria Silva",
 *   "patientPhone": "81999999999",
 *   "patientEmail": "maria@email.com",    // opcional
 *   "datetime": "2026-03-10T14:00:00.000Z",
 *   "city": "Recife",                     // opcional
 *   "serviceType": "consulta",            // opcional
 *   "notes": "Primeira consulta"          // opcional
 * }
 */
export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rateResult = checkRateLimit(`calendar-book:${ip}`, 5, 60);
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: `Muitas requisições. Tente novamente em ${rateResult.resetIn}s.` },
      { status: 429 }
    );
  }

  if (!isCalendarIntegrationActive()) {
    return NextResponse.json(
      {
        error: "Integração com Google Calendar não configurada",
        bookingUrl: process.env.NEXT_PUBLIC_CALENDAR_BOOKING_URL || null,
      },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as Partial<BookingRequest>;

    if (!body.patientName || !body.datetime) {
      return NextResponse.json(
        { error: "Nome do paciente e horário são obrigatórios" },
        { status: 400 }
      );
    }

    const result = await bookAppointment({
      patientName: body.patientName,
      patientPhone: body.patientPhone,
      patientEmail: body.patientEmail,
      datetime: body.datetime,
      city: body.city,
      serviceType: body.serviceType || "consulta",
      notes: body.notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erro ao agendar" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      eventId: result.eventId,
      message: "Consulta agendada com sucesso!",
    });
  } catch (error) {
    console.error("Erro no endpoint /api/calendar/book:", error);
    return NextResponse.json(
      { error: "Erro interno ao agendar consulta" },
      { status: 500 }
    );
  }
}
