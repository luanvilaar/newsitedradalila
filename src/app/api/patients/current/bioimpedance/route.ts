import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET: Retrieve bioimpedance records for current user
 */

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

    const { data: records, error } = await supabase
      .from("bioimpedance_records")
      .select("*")
      .eq("patient_id", user.id)
      .order("measurement_date", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching bioimpedance records:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
