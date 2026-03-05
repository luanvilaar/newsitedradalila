import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/auth-helpers";
import { checkRateLimit } from "@/lib/security/rate-limit";

type FinancialRecordPayload = {
  record_type: "invoice" | "cashflow";
  transaction_type?: "entry" | "exit";
  category?: string;
  description?: string;
  amount: number;
  occurred_at?: string;
  invoice_number?: string;
  invoice_status?: "pending" | "issued" | "cancelled";
  patient_name?: string;
  patient_document?: string;
};

type InvoiceIntegrationResult = {
  ok: boolean;
  message: string;
  invoiceNumber?: string;
  providerResponse?: unknown;
};

const JOAO_PESSOA_IBGE_CODE = "2507507";

function onlyDigits(value?: string | null) {
  return (value || "").replace(/\D/g, "");
}

function buildJoaoPessoaPayload(payload: {
  invoice_number?: string;
  description?: string;
  amount: number;
  occurred_at?: string;
  patient_name?: string;
  patient_document?: string;
  client_id: string;
}) {
  const prestadorCnpj = onlyDigits(process.env.NFE_JP_PRESTADOR_CNPJ);
  const prestadorIm = process.env.NFE_JP_PRESTADOR_INSCRICAO_MUNICIPAL || "";
  const prestadorRazaoSocial = process.env.NFE_JP_PRESTADOR_RAZAO_SOCIAL || "";

  if (!prestadorCnpj || !prestadorIm || !prestadorRazaoSocial) {
    return {
      error:
        "Configure NFE_JP_PRESTADOR_CNPJ, NFE_JP_PRESTADOR_INSCRICAO_MUNICIPAL e NFE_JP_PRESTADOR_RAZAO_SOCIAL para emissão em João Pessoa.",
    };
  }

  const aliquota = Number(process.env.NFE_JP_ALIQUOTA || "0.05");
  const valorServico = Number(payload.amount || 0);
  const valorIss = Number((valorServico * aliquota).toFixed(2));
  const valorLiquido = Number((valorServico - valorIss).toFixed(2));

  const tomadorDocumento = onlyDigits(payload.patient_document);
  const tomador = {
    razao_social: payload.patient_name || "Consumidor Final",
    ...(tomadorDocumento.length === 11
      ? { cpf: tomadorDocumento }
      : tomadorDocumento.length === 14
        ? { cnpj: tomadorDocumento }
        : {}),
  };

  return {
    client_id: payload.client_id,
    municipio: {
      codigo_ibge: JOAO_PESSOA_IBGE_CODE,
      nome: "João Pessoa",
      uf: "PB",
    },
    nfse: {
      numero_referencia: payload.invoice_number || null,
      competencia: (payload.occurred_at || new Date().toISOString()).slice(0, 10),
      natureza_operacao: Number(process.env.NFE_JP_NATUREZA_OPERACAO || "1"),
      regime_especial_tributacao: Number(
        process.env.NFE_JP_REGIME_ESPECIAL_TRIBUTACAO || "0"
      ),
      optante_simples_nacional:
        (process.env.NFE_JP_OPTANTE_SIMPLES_NACIONAL || "false") === "true",
      incentivo_fiscal:
        (process.env.NFE_JP_INCENTIVO_FISCAL || "false") === "true",
      prestador: {
        cnpj: prestadorCnpj,
        inscricao_municipal: prestadorIm,
        razao_social: prestadorRazaoSocial,
      },
      tomador,
      servico: {
        item_lista_servico: process.env.NFE_JP_ITEM_LISTA_SERVICO || "",
        codigo_tributacao_municipio:
          process.env.NFE_JP_CODIGO_TRIBUTACAO_MUNICIPIO ||
          process.env.NFE_JP_SERVICE_CODE ||
          "",
        discriminacao:
          payload.description || "Serviço médico prestado em consulta/procedimento.",
        valores: {
          valor_servicos: valorServico,
          valor_iss: valorIss,
          aliquota,
          valor_liquido_nfse: valorLiquido,
        },
      },
    },
  };
}

function buildNuvemFiscalPayload(payload: {
  invoice_number?: string;
  description?: string;
  amount: number;
  occurred_at?: string;
  patient_name?: string;
  patient_document?: string;
}) {
  const prestadorCnpj = onlyDigits(process.env.NFE_JP_PRESTADOR_CNPJ);
  const prestadorIm = process.env.NFE_JP_PRESTADOR_INSCRICAO_MUNICIPAL || "";

  if (!prestadorCnpj || !prestadorIm) {
    return {
      error:
        "Configure NFE_JP_PRESTADOR_CNPJ e NFE_JP_PRESTADOR_INSCRICAO_MUNICIPAL para integração com a Nuvem Fiscal.",
    };
  }

  const aliquota = Number(process.env.NFE_JP_ALIQUOTA || "0.05");
  const valorServico = Number(payload.amount || 0);
  const tomadorDocumento = onlyDigits(payload.patient_document);

  return {
    ambiente: process.env.NFE_JP_AMBIENTE || "producao",
    referencia: payload.invoice_number || undefined,
    competencia: (payload.occurred_at || new Date().toISOString()).slice(0, 10),
    prestador: {
      cpf_cnpj: prestadorCnpj,
      inscricao_municipal: prestadorIm,
    },
    tomador: {
      razao_social: payload.patient_name || "Consumidor Final",
      ...(tomadorDocumento.length === 11
        ? { cpf: tomadorDocumento }
        : tomadorDocumento.length === 14
          ? { cnpj: tomadorDocumento }
          : {}),
    },
    servico: {
      discriminacao:
        payload.description || "Serviço médico prestado em consulta/procedimento.",
      valor_servicos: valorServico,
      aliquota_iss: aliquota,
      item_lista_servico: process.env.NFE_JP_ITEM_LISTA_SERVICO || undefined,
      codigo_tributacao_municipio:
        process.env.NFE_JP_CODIGO_TRIBUTACAO_MUNICIPIO ||
        process.env.NFE_JP_SERVICE_CODE ||
        undefined,
      municipio_prestacao_servico: JOAO_PESSOA_IBGE_CODE,
    },
  };
}

async function emitInvoiceToProvider(payload: {
  invoice_number?: string;
  description?: string;
  amount: number;
  occurred_at?: string;
  patient_name?: string;
  patient_document?: string;
}): Promise<InvoiceIntegrationResult> {
  const provider =
    process.env.NFE_PROVIDER || "joao_pessoa_prefeitura_nuvemfiscal";
  const providerBaseUrl =
    process.env.NFE_JP_BASE_URL || process.env.NFE_API_BASE_URL;
  const isNuvemFiscalProvider =
    provider.includes("nuvemfiscal") ||
    (providerBaseUrl || "").includes("api.nuvemfiscal.com.br");
  const emitPath =
    process.env.NFE_JP_EMIT_PATH ||
    (isNuvemFiscalProvider ? "/nfse" : "/nfse/emitir");
  const clientId = process.env.NFE_API_CLIENT_ID || "";
  const apiKey = process.env.NFE_API_KEY || "";

  if (!providerBaseUrl) {
    return {
      ok: false,
      message:
        "NFE_JP_BASE_URL (ou NFE_API_BASE_URL) não configurada para integração de notas fiscais.",
    };
  }

  try {
    const normalizedBaseUrl = providerBaseUrl.replace(/\/$/, "");
    const normalizedPath = emitPath.startsWith("/") ? emitPath : `/${emitPath}`;

    const requestBody =
      isNuvemFiscalProvider
        ? buildNuvemFiscalPayload(payload)
        : provider === "joao_pessoa_prefeitura"
        ? buildJoaoPessoaPayload({
            ...payload,
            client_id: clientId,
          })
        : payload;

    if ("error" in requestBody) {
      return {
        ok: false,
        message:
          requestBody.error ||
          "Erro de configuração para emissão municipal de nota fiscal.",
      };
    }

    const response = await fetch(
      `${normalizedBaseUrl}${normalizedPath}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isNuvemFiscalProvider ? {} : { "x-client-id": clientId }),
          ...(apiKey ? { "x-api-key": apiKey } : {}),
          ...((provider === "joao_pessoa_prefeitura" ||
            isNuvemFiscalProvider) && apiKey
            ? { Authorization: `Bearer ${apiKey}` }
            : {}),
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response
      .json()
      .catch(() => null as Record<string, unknown> | null);

    if (!response.ok) {
      return {
        ok: false,
        message:
          (data && typeof data.error === "string" && data.error) ||
          `Falha na integração de NFS-e (status ${response.status}).`,
      };
    }

    const invoiceNumber =
      (data && typeof data.invoice_number === "string"
        ? data.invoice_number
        : undefined) ||
      (data && typeof data.number === "string" ? data.number : undefined);

    return {
      ok: true,
      message: "Nota fiscal integrada com sucesso.",
      invoiceNumber,
      providerResponse: data,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro inesperado ao integrar nota fiscal.",
    };
  }
}

export async function GET(request: Request) {
  const ip = (request.headers as Headers).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`financial:${ip}`, 30, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Muitas requisições." }, { status: 429, headers: { "Retry-After": String(rl.resetIn) } });
  }

  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { supabase } = auth;

    const { data, error } = await supabase
      .from("financial_records")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(50);

    if (error) {
      const isMissingTable =
        error.message.includes("financial_records") ||
        error.message.toLowerCase().includes("schema cache");

      return NextResponse.json(
        {
          error: isMissingTable
            ? "Tabela financial_records nao encontrada. Aplique a migration 004_financial_records.sql no Supabase."
            : error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error listing financial records:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const ip = (request.headers as Headers).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`financial-post:${ip}`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Muitas requisições." }, { status: 429, headers: { "Retry-After": String(rl.resetIn) } });
  }

  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { supabase, userId } = auth;

    const body = (await request.json()) as FinancialRecordPayload;

    if (!body.record_type || !body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: "Tipo de registro e valor são obrigatórios." },
        { status: 400 }
      );
    }

    if (body.record_type === "cashflow" && !body.transaction_type) {
      return NextResponse.json(
        { error: "Tipo de transação (entrada/saída) é obrigatório." },
        { status: 400 }
      );
    }

    if (body.record_type === "invoice" && !body.invoice_status) {
      return NextResponse.json(
        { error: "Status da nota fiscal é obrigatório." },
        { status: 400 }
      );
    }

    let invoiceNumber = body.invoice_number || null;
    let invoiceIntegration: InvoiceIntegrationResult | null = null;

    if (body.record_type === "invoice" && body.invoice_status === "issued") {
      invoiceIntegration = await emitInvoiceToProvider({
        invoice_number: body.invoice_number,
        description: body.description,
        amount: body.amount,
        occurred_at: body.occurred_at,
        patient_name: body.patient_name,
        patient_document: body.patient_document,
      });

      if (!invoiceIntegration.ok) {
        return NextResponse.json(
          {
            error: `Não foi possível emitir a nota fiscal no provedor: ${invoiceIntegration.message}`,
          },
          { status: 502 }
        );
      }

      if (invoiceIntegration.invoiceNumber) {
        invoiceNumber = invoiceIntegration.invoiceNumber;
      }
    }

    const { data, error } = await supabase
      .from("financial_records")
      .insert({
        created_by: userId,
        record_type: body.record_type,
        transaction_type: body.transaction_type || null,
        category: body.category || null,
        description: body.description || null,
        amount: body.amount,
        occurred_at: body.occurred_at || new Date().toISOString(),
        invoice_number: invoiceNumber,
        invoice_status: body.invoice_status || null,
        patient_name: body.patient_name || null,
        patient_document: body.patient_document || null,
      })
      .select("*")
      .single();

    if (error) {
      const isMissingTable =
        error.message.includes("financial_records") ||
        error.message.toLowerCase().includes("schema cache");

      return NextResponse.json(
        {
          error: isMissingTable
            ? "Tabela financial_records nao encontrada. Aplique a migration 004_financial_records.sql no Supabase."
            : error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        data,
        integration:
          body.record_type === "invoice" && body.invoice_status === "issued"
            ? invoiceIntegration
            : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating financial record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
