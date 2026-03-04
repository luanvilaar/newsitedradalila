import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "admin";
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = await isAdmin(supabase, user.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    // Fetch all stats in parallel
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayISO = firstDayOfMonth.toISOString();

    const [patientsRes, servicesRes, bioRes, docsRes, recentActivityRes] =
      await Promise.allSettled([
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("services")
          .select("id", { count: "exact", head: true })
          .gte("scheduled_date", todayISO)
          .lt(
            "scheduled_date",
            new Date(today.getTime() + 86400000).toISOString()
          )
          .eq("status", "scheduled"),
        supabase
          .from("bioimpedance_records")
          .select("id", { count: "exact", head: true })
          .gte("created_at", firstDayISO),
        supabase
          .from("documents")
          .select("id", { count: "exact", head: true })
          .gte("created_at", firstDayISO),
        supabase
          .from("patient_history")
          .select(
            `
            id,
            action,
            entity_type,
            created_at,
            profiles:performed_by (full_name)
          `
          )
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

    const totalPatients =
      patientsRes.status === "fulfilled" ? patientsRes.value.count || 0 : 0;
    const todayServices =
      servicesRes.status === "fulfilled" ? servicesRes.value.count || 0 : 0;
    const monthlyBioimpedance =
      bioRes.status === "fulfilled" ? bioRes.value.count || 0 : 0;
    const recentDocuments =
      docsRes.status === "fulfilled" ? docsRes.value.count || 0 : 0;
    const recentActivity =
      recentActivityRes.status === "fulfilled"
        ? recentActivityRes.value.data || []
        : [];

    return NextResponse.json({
      totalPatients,
      todayServices,
      monthlyBioimpedance,
      recentDocuments,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
