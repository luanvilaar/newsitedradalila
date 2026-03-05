import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  cancelAppointment,
  findAppointmentsByPatient,
  isCalendarIntegrationActive,
} from "@/lib/google-calendar";

/**
 * POST /api/calendar/cancel
 *
 * Cancela uma consulta no Google Calendar.
 *
 * Body (por eventId):
 * { "eventId": "abc123" }
 *
 * Body (por nome do paciente - busca e cancela a próxima):
 * { "patientName": "Maria Silva" }
 */
export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rateResult = checkRateLimit(`calendar-cancel:${ip}`, 5, 60);
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: `Muitas requisições. Tente novamente em ${rateResult.resetIn}s.` },
      { status: 429 }
    );
  }

  if (!isCalendarIntegrationActive()) {
    return NextResponse.json(
      { error: "Integração com Google Calendar não configurada" },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as {
      eventId?: string;
      patientName?: string;
    };

    let eventId = body.eventId;

    // Se não tem eventId, busca pelo nome do paciente
    if (!eventId && body.patientName) {
      const appointments = await findAppointmentsByPatient(body.patientName);
      if (appointments.length === 0) {
        return NextResponse.json(
          { error: "Nenhuma consulta encontrada para este paciente" },
          { status: 404 }
        );
      }
      eventId = appointments[0].id || undefined;
    }

    if (!eventId) {
      return NextResponse.json(
        { error: "Informe eventId ou patientName para cancelar" },
        { status: 400 }
      );
    }

    const result = await cancelAppointment(eventId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erro ao cancelar" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Consulta cancelada com sucesso",
    });
  } catch (error) {
    console.error("Erro no endpoint /api/calendar/cancel:", error);
    return NextResponse.json(
      { error: "Erro interno ao cancelar consulta" },
      { status: 500 }
    );
  }
}
