import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type ParsedMedication = {
  medication_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  product_code: string;
  supplier_name: string;
  supplier_document: string;
  supplier_contact: string;
  occurred_at: string;
  notes: string;
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
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Envie um arquivo PDF válido." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // pdf-parse v2 uses class-based API: new PDFParse({ data }) + .getText()
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const pdfText: string = result.text ?? "";

    if (!pdfText || pdfText.trim().length < 20) {
      return NextResponse.json(
        { error: "Não foi possível extrair texto do PDF." },
        { status: 422 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Você é um assistente especializado em extrair dados de orçamentos/pedidos de compra farmacêuticos brasileiros.
Extraia as informações do documento e retorne um JSON com a estrutura exata abaixo:
{
  "supplier_name": "nome da empresa fornecedora",
  "supplier_document": "CNPJ da empresa somente números, sem pontuação",
  "supplier_contact": "telefone ou email de contato da empresa",
  "occurred_at": "data de emissão do documento no formato YYYY-MM-DD",
  "order_number": "número do orçamento ou pedido",
  "items": [
    {
      "product_code": "código do produto (ex: PA05060012)",
      "medication_name": "descrição completa conforme consta no documento",
      "quantity": 10,
      "unit": "unidade inferida da descrição: AMP→amp, FR→fr, CX→cx, padrão→un",
      "unit_price": 30.00
    }
  ]
}
Regras importantes:
- Inclua TODOS os itens da tabela de produtos, sem omitir nenhum
- medication_name deve ser exatamente o texto da coluna Descrição (incluindo dosagens e volumes)
- unit_price é o valor do campo "Vlr Unit" ou "Valor Unitário"
- quantity é o valor do campo "Quant." ou "Quantidade"
- Se não encontrar um campo, use string vazia ou 0 conforme o tipo
- Retorne SOMENTE o JSON, sem texto ou markdown adicional`,
        },
        {
          role: "user",
          content: `Extraia os dados deste orçamento farmacêutico:\n\n${pdfText}`,
        },
      ],
    });

    const rawJson = completion.choices[0].message.content ?? "{}";
    const extracted = JSON.parse(rawJson) as {
      supplier_name?: string;
      supplier_document?: string;
      supplier_contact?: string;
      occurred_at?: string;
      order_number?: string;
      items?: Array<{
        product_code: string;
        medication_name: string;
        quantity: number;
        unit: string;
        unit_price: number;
      }>;
    };

    if (!extracted.items || extracted.items.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item de medicação encontrado no PDF." },
        { status: 422 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const supplierName = extracted.supplier_name || "Fornecedor não identificado";
    const supplierDoc = (extracted.supplier_document || "").replace(/\D/g, "");
    const supplierContact = extracted.supplier_contact || "";
    const occurredAt = extracted.occurred_at || today;
    const orderNumber = extracted.order_number || "";

    const medications: ParsedMedication[] = extracted.items.map((item) => {
      const unitPriceStr = item.unit_price
        ? ` | Vlr Unit: R$${Number(item.unit_price).toFixed(2)}`
        : "";
      return {
        medication_name: item.medication_name,
        quantity: item.quantity,
        unit: item.unit || "un",
        unit_price: item.unit_price || 0,
        product_code: item.product_code || "",
        supplier_name: supplierName,
        supplier_document: supplierDoc,
        supplier_contact: supplierContact,
        occurred_at: occurredAt,
        notes: [
          orderNumber ? `Orçamento Nº ${orderNumber}` : "Importado via PDF",
          item.product_code ? `Cód: ${item.product_code}` : "",
          unitPriceStr ? `Vlr Unit: R$${Number(item.unit_price).toFixed(2)}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
      };
    });

    return NextResponse.json({
      medications,
      supplier_name: supplierName,
      order_number: orderNumber,
    });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: `Erro ao processar o PDF: ${msg}` }, { status: 500 });
  }
}
