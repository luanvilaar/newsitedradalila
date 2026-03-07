import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export type StockItem = {
  medication_name: string;
  unit: string;
  current_stock: number;
  total_entries: number;
  total_exits: number;
  last_entry_at: string | null;
  last_exit_at: string | null;
};

async function isAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<boolean> {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdmin(supabase, user.id);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const { data: movements, error } = await supabase
      .from("stock_movements")
      .select("medication_name, unit, movement_type, quantity, occurred_at")
      .order("occurred_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Aggregate in JS: group by medication_name + unit
    const map = new Map<string, StockItem>();

    for (const row of movements ?? []) {
      const key = `${row.medication_name}||${row.unit}`;
      if (!map.has(key)) {
        map.set(key, {
          medication_name: row.medication_name,
          unit: row.unit ?? "un",
          current_stock: 0,
          total_entries: 0,
          total_exits: 0,
          last_entry_at: null,
          last_exit_at: null,
        });
      }

      const item = map.get(key)!;
      const qty = Number(row.quantity) || 0;

      if (row.movement_type === "entry") {
        item.current_stock += qty;
        item.total_entries += qty;
        if (!item.last_entry_at || row.occurred_at > item.last_entry_at) {
          item.last_entry_at = row.occurred_at;
        }
      } else {
        item.current_stock -= qty;
        item.total_exits += qty;
        if (!item.last_exit_at || row.occurred_at > item.last_exit_at) {
          item.last_exit_at = row.occurred_at;
        }
      }
    }

    const inventory = Array.from(map.values()).sort((a, b) =>
      a.medication_name.localeCompare(b.medication_name)
    );

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error fetching stock inventory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
