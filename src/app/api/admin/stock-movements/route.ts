import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type StockMovementPayload = {
  movement_type: "entry" | "exit";
  medication_name: string;
  quantity: number;
  unit?: string;
  supplier_name: string;
  supplier_document?: string;
  supplier_contact?: string;
  batch_code?: string;
  expiry_date?: string | null;
  occurred_at?: string;
  notes?: string;
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
      return NextResponse.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("stock_movements")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(100);

    if (error) {
      const isMissingTable =
        error.message.includes("stock_movements") ||
        error.message.toLowerCase().includes("schema cache");

      return NextResponse.json(
        {
          error: isMissingTable
            ? "Tabela stock_movements nao encontrada. Aplique a migration 007_stock_movements.sql no Supabase."
            : error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error listing stock movements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
      return NextResponse.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as StockMovementPayload;

    if (!body.movement_type || !body.medication_name || !body.quantity) {
      return NextResponse.json(
        { error: "Tipo, medicamento e quantidade são obrigatórios." },
        { status: 400 }
      );
    }

    // supplier_name is required for entries, optional for exits (sales to patients)
    if (body.movement_type === "entry" && !body.supplier_name) {
      return NextResponse.json(
        { error: "Empresa fornecedora é obrigatória para entradas." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("stock_movements")
      .insert({
        created_by: user.id,
        movement_type: body.movement_type,
        medication_name: body.medication_name,
        quantity: body.quantity,
        unit: body.unit || "un",
        supplier_name: body.supplier_name,
        supplier_document: body.supplier_document || null,
        supplier_contact: body.supplier_contact || null,
        batch_code: body.batch_code || null,
        expiry_date: body.expiry_date || null,
        occurred_at: body.occurred_at || new Date().toISOString(),
        notes: body.notes || null,
      })
      .select("*")
      .single();

    if (error) {
      const isMissingTable =
        error.message.includes("stock_movements") ||
        error.message.toLowerCase().includes("schema cache");

      return NextResponse.json(
        {
          error: isMissingTable
            ? "Tabela stock_movements nao encontrada. Aplique a migration 007_stock_movements.sql no Supabase."
            : error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating stock movement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
