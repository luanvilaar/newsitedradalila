import { NextResponse } from "next/server";

/**
 * GET /api/calendar/slots
 *
 * Retorna o link de agendamento online do Google Calendar Appointment Scheduling.
 * Configure NEXT_PUBLIC_CALENDAR_BOOKING_URL no .env.local com a URL do seu
 * Google Calendar Appointment Scheduling.
 */
export async function GET() {
  const bookingUrl = process.env.NEXT_PUBLIC_CALENDAR_BOOKING_URL ?? null;

  return NextResponse.json({
    bookingUrl,
    slots: [], // mantido por compatibilidade — agendamento é feito via bookingUrl
  });
}
