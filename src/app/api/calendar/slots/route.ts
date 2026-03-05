import { NextRequest, NextResponse } from "next/server";
import {
  getAvailableSlots,
  isCalendarIntegrationActive,
} from "@/lib/google-calendar";

/**
 * GET /api/calendar/slots?days=90&city=Recife
 *
 * Retorna horários disponíveis do Google Calendar.
 * Se a integração OAuth não estiver ativa, retorna apenas o bookingUrl.
 * Por padrão, consulta 90 dias (3 meses) de disponibilidade.
 */
export async function GET(req: NextRequest) {
  const bookingUrl = process.env.NEXT_PUBLIC_CALENDAR_BOOKING_URL ?? null;
  const days = Number(req.nextUrl.searchParams.get("days") || "90");
  const city = req.nextUrl.searchParams.get("city") || undefined;

  if (!isCalendarIntegrationActive()) {
    return NextResponse.json({
      bookingUrl,
      slots: [],
      source: "booking_url_only",
    });
  }

  try {
    const slots = await getAvailableSlots(Math.min(days, 30), city);

    return NextResponse.json({
      bookingUrl,
      slots,
      source: "google_calendar_api",
      total: slots.length,
    });
  } catch (error) {
    console.error("Erro ao buscar slots:", error);
    return NextResponse.json({
      bookingUrl,
      slots: [],
      source: "fallback",
      error: "Erro ao consultar Google Calendar",
    });
  }
}
