import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function isAdmin(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}

// Generate array of the last N month start dates (oldest → newest)
function lastNMonths(n: number): Date[] {
  const months: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() - i);
    months.push(new Date(d));
  }
  return months;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shortLabel(d: Date): string {
  return d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  consultation: "Consulta",
  procedure: "Procedimento",
  follow_up: "Retorno",
  implant: "Implante",
};

const PRESCRIPTION_TYPE_LABELS: Record<string, string> = {
  medication: "Medicamento",
  diet: "Dieta",
  workout: "Treino",
  supplement: "Suplemento",
};

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await isAdmin(supabase, user.id)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const months = lastNMonths(6);
    const sixMonthsAgo = months[0].toISOString();

    // Parallel fetches
    const [patientsRes, servicesRes, prescriptionsRes, totalPatientsRes] =
      await Promise.allSettled([
        // New patients created per month (last 6 months)
        supabase
          .from("patients")
          .select("created_at")
          .gte("created_at", sixMonthsAgo),

        // All services in last 6 months — type + scheduled_date
        supabase
          .from("services")
          .select("type, scheduled_date, status")
          .gte("scheduled_date", sixMonthsAgo),

        // Prescriptions grouped by type (all time)
        supabase
          .from("prescriptions")
          .select("type"),

        // Total patients ever
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true }),
      ]);

    // ── 1. Patients created per month ────────────────────────────────────────
    const patientRows =
      patientsRes.status === "fulfilled" ? patientsRes.value.data ?? [] : [];

    const patientsByMonth = months.map((m) => {
      const key = monthKey(m);
      const count = patientRows.filter((p) => {
        const d = new Date(p.created_at);
        return monthKey(d) === key;
      }).length;
      return { month: shortLabel(m), value: count };
    });

    // ── 2. Services per month + by type ───────────────────────────────────────
    const serviceRows =
      servicesRes.status === "fulfilled" ? servicesRes.value.data ?? [] : [];

    const servicesByMonth = months.map((m) => {
      const key = monthKey(m);
      const inMonth = serviceRows.filter((s) => {
        const d = new Date(s.scheduled_date);
        return monthKey(d) === key;
      });
      return {
        month: shortLabel(m),
        consultas: inMonth.filter((s) => s.type === "consultation").length,
        procedimentos: inMonth.filter((s) => s.type !== "consultation").length,
      };
    });

    // Services by type — all-time count using the last-6-months slice as proxy
    const serviceTypeCounts: Record<string, number> = {};
    for (const s of serviceRows) {
      serviceTypeCounts[s.type] = (serviceTypeCounts[s.type] ?? 0) + 1;
    }
    const servicesByType = Object.entries(SERVICE_TYPE_LABELS)
      .map(([key, label]) => ({ name: label, value: serviceTypeCounts[key] ?? 0 }))
      .filter((e) => e.value > 0);

    // ── 3. Prescriptions by type ──────────────────────────────────────────────
    const prescriptionRows =
      prescriptionsRes.status === "fulfilled"
        ? prescriptionsRes.value.data ?? []
        : [];

    const prescTypeCounts: Record<string, number> = {};
    for (const p of prescriptionRows) {
      prescTypeCounts[p.type] = (prescTypeCounts[p.type] ?? 0) + 1;
    }
    const prescriptionsByType = Object.entries(PRESCRIPTION_TYPE_LABELS)
      .map(([key, label]) => ({ name: label, value: prescTypeCounts[key] ?? 0 }))
      .filter((e) => e.value > 0);

    // ── 4. KPIs ────────────────────────────────────────────────────────────────
    const totalPatients =
      totalPatientsRes.status === "fulfilled"
        ? totalPatientsRes.value.count ?? 0
        : 0;

    const completedServices = serviceRows.filter((s) => s.status === "completed").length;
    const cancelledServices = serviceRows.filter((s) => s.status === "cancelled").length;
    const totalServices6m = serviceRows.length;

    const completionRate =
      totalServices6m > 0
        ? Math.round((completedServices / totalServices6m) * 100)
        : null;

    const cancellationRate =
      totalServices6m > 0
        ? Math.round((cancelledServices / totalServices6m) * 100)
        : null;

    const newPatientsThisMonth = patientsByMonth[patientsByMonth.length - 1]?.value ?? 0;
    const newPatientsPrevMonth = patientsByMonth[patientsByMonth.length - 2]?.value ?? 0;

    return NextResponse.json({
      patientsByMonth,
      servicesByMonth,
      servicesByType,
      prescriptionsByType,
      kpis: {
        totalPatients,
        newPatientsThisMonth,
        newPatientsPrevMonth,
        completionRate,
        cancellationRate,
        totalServices6m,
      },
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
