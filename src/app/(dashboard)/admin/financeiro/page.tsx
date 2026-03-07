"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Trash2, Upload, FileText, CheckCircle, X, AlertTriangle, Package, ShoppingCart } from "lucide-react";

type FinancialRecord = {
  id: string;
  record_type: "invoice" | "cashflow";
  transaction_type: "entry" | "exit" | null;
  category: string | null;
  description: string | null;
  amount: number;
  occurred_at: string;
  invoice_number: string | null;
  invoice_status: "pending" | "issued" | "cancelled" | null;
  patient_name: string | null;
  patient_document: string | null;
};

type InvoiceIntegration = {
  ok?: boolean;
  message?: string;
  invoiceNumber?: string;
  providerResponse?: Record<string, unknown> | null;
};

type InvoiceSubmitResponse = {
  data?: FinancialRecord;
  integration?: InvoiceIntegration | null;
};

type StockMovement = {
  id: string;
  movement_type: "entry" | "exit";
  medication_name: string;
  quantity: number;
  unit: string;
  supplier_name: string;
  supplier_document: string;
  supplier_contact: string;
  batch_code: string;
  expiry_date: string;
  occurred_at: string;
  notes: string;
};

type ParsedMedication = {
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

type StockItem = {
  medication_name: string;
  unit: string;
  current_stock: number;
  total_entries: number;
  total_exits: number;
  last_entry_at: string | null;
  last_exit_at: string | null;
};

const today = new Date().toISOString().split("T")[0];

export default function FinanceiroPage() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<FinancialRecord | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [invoiceForm, setInvoiceForm] = useState({
    patient_name: "",
    patient_document: "",
    service_types: [] as string[],
    amount: "",
    invoice_number: "",
    invoice_status: "pending" as "pending" | "issued" | "cancelled",
    occurred_at: today,
  });

  const [cashFlowForm, setCashFlowForm] = useState({
    transaction_type: "entry" as "entry" | "exit",
    category: "consultation",
    amount: "",
    description: "",
    occurred_at: today,
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState<string | null>(null);
  const [stockForm, setStockForm] = useState({
    movement_type: "entry" as "entry" | "exit",
    medication_name: "",
    quantity: "",
    unit: "un",
    supplier_name: "",
    supplier_document: "",
    supplier_contact: "",
    batch_code: "",
    expiry_date: "",
    occurred_at: today,
    notes: "",
  });

  const [pdfParsing, setPdfParsing] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [parsedMedications, setParsedMedications] = useState<ParsedMedication[]>([]);
  const [pdfOrderNumber, setPdfOrderNumber] = useState<string>("");
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Inventory state
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [saleForm, setSaleForm] = useState({
    patient_name: "",
    medication_name: "",
    quantity: "",
    occurred_at: today,
    notes: "",
  });
  const [saleSubmitting, setSaleSubmitting] = useState(false);

  async function fetchInventory() {
    setInventoryLoading(true);
    setInventoryError(null);
    try {
      const res = await fetch("/api/admin/stock-inventory");
      const data = await res.json();
      if (!res.ok) { setInventoryError(data.error || "Erro ao carregar inventário"); return; }
      setInventory(Array.isArray(data) ? data : []);
    } catch {
      setInventoryError("Erro ao carregar inventário.");
    } finally {
      setInventoryLoading(false);
    }
  }

  async function submitSale() {
    setSuccess(null);
    setError(null);
    const qty = Number(saleForm.quantity);
    if (!saleForm.patient_name || !saleForm.medication_name || !qty || qty <= 0) {
      setError("Paciente, medicação e quantidade são obrigatórios.");
      return;
    }
    const item = inventory.find((i) => i.medication_name === saleForm.medication_name);
    if (item && item.current_stock < qty) {
      setError(`Estoque insuficiente. Disponível: ${item.current_stock} ${item.unit}.`);
      return;
    }
    setSaleSubmitting(true);
    const res = await fetch("/api/admin/stock-movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movement_type: "exit",
        medication_name: saleForm.medication_name,
        quantity: qty,
        unit: item?.unit || "un",
        supplier_name: `Paciente: ${saleForm.patient_name}`,
        occurred_at: new Date(`${saleForm.occurred_at}T12:00:00`).toISOString(),
        notes: saleForm.notes || `Venda para ${saleForm.patient_name}`,
      }),
    });
    setSaleSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao registrar venda.");
      return;
    }
    setSuccess(`Saída registrada: ${qty} ${item?.unit || "un"} de ${saleForm.medication_name} para ${saleForm.patient_name}.`);
    setSaleForm({ patient_name: "", medication_name: "", quantity: "", occurred_at: today, notes: "" });
    fetchInventory();
    fetchStockMovements();
  }

  async function handlePdfUpload(file: File) {
    setPdfParsing(true);
    setPdfError(null);
    setParsedMedications([]);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("/api/admin/stock-movements/parse-pdf", {
        method: "POST",
        body: formData,
      });
      let data: Record<string, unknown>;
      try {
        data = await res.json();
      } catch {
        setPdfError(`Erro interno do servidor (${res.status}). Verifique os logs.`);
        return;
      }
      if (!res.ok) {
        setPdfError((data.error as string) || "Erro ao processar PDF.");
        return;
      }
      setParsedMedications((data.medications as ParsedMedication[]) ?? []);
      setPdfOrderNumber((data.order_number as string) ?? "");
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Erro de conexão ao processar PDF.");
    } finally {
      setPdfParsing(false);
    }
  }

  async function confirmBatchEntry() {
    if (parsedMedications.length === 0) return;
    setBatchSubmitting(true);
    setSuccess(null);
    setError(null);

    let successCount = 0;
    for (const med of parsedMedications) {
      const res = await fetch("/api/admin/stock-movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movement_type: "entry",
          medication_name: med.medication_name,
          quantity: med.quantity,
          unit: med.unit,
          batch_code: med.product_code || undefined,
          supplier_name: med.supplier_name,
          supplier_document: med.supplier_document,
          supplier_contact: med.supplier_contact,
          occurred_at: new Date(`${med.occurred_at}T12:00:00`).toISOString(),
          notes: med.notes,
        }),
      });
      if (res.ok) successCount++;
    }

    setBatchSubmitting(false);
    setParsedMedications([]);
    setPdfOrderNumber("");
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    setSuccess(`${successCount} medicação(ões) registradas com sucesso no estoque.`);
    fetchStockMovements();
  }

  function extractProtocol(providerResponse?: Record<string, unknown> | null) {
    if (!providerResponse) return null;

    const maybeProtocol =
      providerResponse.protocolo ||
      providerResponse.protocol ||
      providerResponse.id ||
      providerResponse.codigo;

    if (typeof maybeProtocol === "string" || typeof maybeProtocol === "number") {
      return String(maybeProtocol);
    }

    return null;
  }

  function openDelete(record: FinancialRecord) {
    setDeleteTarget(record);
    setDeletePassword("");
    setDeleteError(null);
    setTimeout(() => passwordInputRef.current?.focus(), 50);
  }

  function closeDelete() {
    setDeleteTarget(null);
    setDeletePassword("");
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    if (!deletePassword) {
      setDeleteError("Informe a senha para confirmar.");
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/financial-records/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Erro ao excluir registro.");
        return;
      }
      closeDelete();
      fetchRecords();
    } finally {
      setDeleteLoading(false);
    }
  }

  async function fetchRecords() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/financial-records");
      if (!res.ok) throw new Error("Erro ao carregar financeiro");
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar financeiro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecords();
    fetchStockMovements();
    fetchInventory();
  }, []);

  const summary = useMemo(() => {
    return records.reduce(
      (acc, record) => {
        if (record.record_type === "cashflow") {
          if (record.transaction_type === "entry") acc.entry += Number(record.amount || 0);
          if (record.transaction_type === "exit") acc.exit += Number(record.amount || 0);
        }
        return acc;
      },
      { entry: 0, exit: 0 }
    );
  }, [records]);

  const balance = summary.entry - summary.exit;

  async function submitInvoice() {
    setSuccess(null);
    setError(null);

    const amount = Number(invoiceForm.amount);
    if (invoiceForm.service_types.length === 0 || !amount || amount <= 0) {
      setError("Selecione ao menos um tipo de servico e informe um valor valido.");
      return;
    }

    const serviceLabelMap: Record<string, string> = {
      consulta: "Consulta",
      tratamento: "Tratamento",
      medicacoes: "Medicacoes",
    };

    const serviceSummary = invoiceForm.service_types
      .map((key) => serviceLabelMap[key] || key)
      .join(", ");

    const res = await fetch("/api/admin/financial-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        record_type: "invoice",
        category: "invoice",
        description: serviceSummary,
        amount,
        invoice_number: invoiceForm.invoice_number,
        invoice_status: invoiceForm.invoice_status,
        patient_name: invoiceForm.patient_name,
        patient_document: invoiceForm.patient_document,
        occurred_at: new Date(`${invoiceForm.occurred_at}T12:00:00`).toISOString(),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar nota fiscal");
      return;
    }

    const responseData = (await res.json()) as InvoiceSubmitResponse;

    const invoiceNumber =
      responseData.integration?.invoiceNumber || responseData.data?.invoice_number || null;
    const protocol = extractProtocol(responseData.integration?.providerResponse);

    if (invoiceForm.invoice_status === "issued") {
      const details = [
        invoiceNumber ? `Nº ${invoiceNumber}` : null,
        protocol ? `Protocolo ${protocol}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      setSuccess(
        details
          ? `NFS-e emitida com sucesso (${details}).`
          : responseData.integration?.message || "NFS-e emitida com sucesso."
      );
    } else {
      setSuccess("Nota fiscal salva com sucesso.");
    }

    setInvoiceForm({
      patient_name: "",
      patient_document: "",
      service_types: [],
      amount: "",
      invoice_number: "",
      invoice_status: "pending",
      occurred_at: today,
    });

    fetchRecords();
  }

  async function submitCashFlow() {
    setSuccess(null);
    setError(null);

    const amount = Number(cashFlowForm.amount);
    if (!amount || amount <= 0) {
      setError("Informe um valor válido para o fluxo de caixa.");
      return;
    }

    const res = await fetch("/api/admin/financial-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        record_type: "cashflow",
        transaction_type: cashFlowForm.transaction_type,
        category: cashFlowForm.category,
        amount,
        description: cashFlowForm.description,
        occurred_at: new Date(`${cashFlowForm.occurred_at}T12:00:00`).toISOString(),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar fluxo de caixa");
      return;
    }

    setCashFlowForm({
      transaction_type: "entry",
      category: "consultation",
      amount: "",
      description: "",
      occurred_at: today,
    });

    fetchRecords();
  }

  async function fetchStockMovements() {
    try {
      setStockLoading(true);
      setStockError(null);
      const res = await fetch("/api/admin/stock-movements");
      if (!res.ok) throw new Error("Erro ao carregar estoque");
      const data = await res.json();
      setStockMovements(Array.isArray(data) ? data : []);
    } catch (err) {
      setStockError(err instanceof Error ? err.message : "Erro ao carregar estoque");
    } finally {
      setStockLoading(false);
    }
  }

  async function submitStockMovement() {
    setSuccess(null);
    setError(null);

    const quantity = Number(stockForm.quantity);
    if (!stockForm.medication_name || !quantity || quantity <= 0) {
      setError("Informe o medicamento e a quantidade para registrar o estoque.");
      return;
    }

    if (!stockForm.supplier_name) {
      setError("Informe a empresa fornecedora da medicação.");
      return;
    }

    const res = await fetch("/api/admin/stock-movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movement_type: stockForm.movement_type,
        medication_name: stockForm.medication_name,
        quantity,
        unit: stockForm.unit,
        supplier_name: stockForm.supplier_name,
        supplier_document: stockForm.supplier_document,
        supplier_contact: stockForm.supplier_contact,
        batch_code: stockForm.batch_code,
        expiry_date: stockForm.expiry_date || null,
        occurred_at: new Date(`${stockForm.occurred_at}T12:00:00`).toISOString(),
        notes: stockForm.notes,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar movimentação de estoque");
      return;
    }

    setStockForm({
      movement_type: "entry",
      medication_name: "",
      quantity: "",
      unit: "un",
      supplier_name: "",
      supplier_document: "",
      supplier_contact: "",
      batch_code: "",
      expiry_date: "",
      occurred_at: today,
      notes: "",
    });

    setSuccess("Movimentação registrada com sucesso.");
    fetchStockMovements();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl tracking-wide text-accent-dark">FINANCEIRO</h1>
        <p className="text-text-secondary text-sm mt-1">
          Emissão de notas fiscais (Prefeitura de João Pessoa) e fluxo de caixa.
        </p>
      </div>

      {success && (
        <Card className="border border-success/20 bg-success/5">
          <p className="text-sm text-success">{success}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-text-muted mb-1">Entradas</p>
          <p className="text-2xl font-semibold text-success">
            {summary.entry.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-text-muted mb-1">Saídas</p>
          <p className="text-2xl font-semibold text-error">
            {summary.exit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-text-muted mb-1">Saldo</p>
          <p className="text-2xl font-semibold text-text-primary">
            {balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </Card>
      </div>

      <Tabs
        tabs={[
          {
            id: "fiscal",
            label: "Fiscal",
            content: (
              <Card>
                <h2 className="font-medium text-text-primary mb-4">Emissão de Nota Fiscal</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="invoice_patient_name"
                      label="Paciente / Tomador"
                      value={invoiceForm.patient_name}
                      onChange={(e) =>
                        setInvoiceForm((p) => ({ ...p, patient_name: e.target.value }))
                      }
                    />
                    <Input
                      id="invoice_patient_document"
                      label="CPF/CNPJ"
                      value={invoiceForm.patient_document}
                      onChange={(e) =>
                        setInvoiceForm((p) => ({ ...p, patient_document: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-text-secondary">
                      Tipo de Servico *
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "consulta", label: "Consulta" },
                        { id: "tratamento", label: "Tratamento" },
                        { id: "medicacoes", label: "Medicacoes" },
                      ].map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-text-primary"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-[var(--color-accent-gold)]"
                            checked={invoiceForm.service_types.includes(item.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setInvoiceForm((p) => ({
                                ...p,
                                service_types: checked
                                  ? [...p.service_types, item.id]
                                  : p.service_types.filter((value) => value !== item.id),
                              }));
                            }}
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      id="invoice_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      label="Valor (R$) *"
                      value={invoiceForm.amount}
                      onChange={(e) => setInvoiceForm((p) => ({ ...p, amount: e.target.value }))}
                    />
                    <Input
                      id="invoice_number"
                      label="Número da Nota"
                      value={invoiceForm.invoice_number}
                      onChange={(e) =>
                        setInvoiceForm((p) => ({ ...p, invoice_number: e.target.value }))
                      }
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-text-secondary" htmlFor="invoice_status">
                        Status NF
                      </label>
                      <select
                        id="invoice_status"
                        className="w-full px-4 py-3 bg-white border border-border rounded-[var(--radius-md)] text-text-primary"
                        value={invoiceForm.invoice_status}
                        onChange={(e) =>
                          setInvoiceForm((p) => ({
                            ...p,
                            invoice_status: e.target.value as "pending" | "issued" | "cancelled",
                          }))
                        }
                      >
                        <option value="pending">Pendente</option>
                        <option value="issued">Emitida</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    id="invoice_date"
                    type="date"
                    label="Data"
                    value={invoiceForm.occurred_at}
                    onChange={(e) => setInvoiceForm((p) => ({ ...p, occurred_at: e.target.value }))}
                  />

                  <div className="flex justify-end">
                    <Button variant="premium" onClick={submitInvoice}>
                      Salvar Nota Fiscal
                    </Button>
                  </div>
                </div>
              </Card>
            ),
          },
          {
            id: "cashflow",
            label: "Fluxo de Caixa",
            content: (
              <Card>
                <h2 className="font-medium text-text-primary mb-4">Fluxo de Caixa</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-text-secondary" htmlFor="cash_type">
                        Tipo
                      </label>
                      <select
                        id="cash_type"
                        className="w-full px-4 py-3 bg-white border border-border rounded-[var(--radius-md)] text-text-primary"
                        value={cashFlowForm.transaction_type}
                        onChange={(e) =>
                          setCashFlowForm((p) => ({
                            ...p,
                            transaction_type: e.target.value as "entry" | "exit",
                          }))
                        }
                      >
                        <option value="entry">Entrada</option>
                        <option value="exit">Saída</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-text-secondary" htmlFor="cash_category">
                        Categoria
                      </label>
                      <select
                        id="cash_category"
                        className="w-full px-4 py-3 bg-white border border-border rounded-[var(--radius-md)] text-text-primary"
                        value={cashFlowForm.category}
                        onChange={(e) =>
                          setCashFlowForm((p) => ({ ...p, category: e.target.value }))
                        }
                      >
                        <option value="consultation">Consulta</option>
                        <option value="procedure">Procedimento</option>
                        <option value="operational-expense">Despesa Operacional</option>
                        <option value="taxes">Impostos/Taxas</option>
                        <option value="other">Outros</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="cash_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      label="Valor (R$) *"
                      value={cashFlowForm.amount}
                      onChange={(e) => setCashFlowForm((p) => ({ ...p, amount: e.target.value }))}
                    />
                    <Input
                      id="cash_date"
                      type="date"
                      label="Data"
                      value={cashFlowForm.occurred_at}
                      onChange={(e) =>
                        setCashFlowForm((p) => ({ ...p, occurred_at: e.target.value }))
                      }
                    />
                  </div>

                  <Input
                    id="cash_description"
                    label="Descrição"
                    placeholder="Detalhe o lançamento"
                    value={cashFlowForm.description}
                    onChange={(e) =>
                      setCashFlowForm((p) => ({ ...p, description: e.target.value }))
                    }
                  />

                  <div className="flex justify-end">
                    <Button variant="premium" onClick={submitCashFlow}>
                      Salvar Lançamento
                    </Button>
                  </div>
                </div>
              </Card>
            ),
          },
          {
            id: "estoque",
            label: "Estoque",
            content: (
              <div className="space-y-6">
                {/* PDF Import Section */}
                <Card>
                  <h2 className="font-medium text-text-primary mb-1">Importar Orçamento PDF</h2>
                  <p className="text-xs text-text-muted mb-4">
                    Faça upload do PDF do fornecedor para dar entrada automática das medicações.
                  </p>

                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="pdf-upload"
                      className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-[var(--radius-md)] border border-dashed border-border hover:border-accent-gold/60 hover:bg-accent-gold/5 transition-colors text-sm text-text-secondary"
                    >
                      <Upload size={16} />
                      Selecionar PDF
                    </label>
                    <input
                      ref={pdfInputRef}
                      id="pdf-upload"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePdfUpload(file);
                      }}
                    />
                    {pdfParsing && (
                      <span className="text-sm text-text-muted animate-pulse">Processando PDF...</span>
                    )}
                  </div>

                  {pdfError && (
                    <p className="text-sm text-error mt-3">{pdfError}</p>
                  )}

                  {parsedMedications.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className="text-accent-dark" />
                        <span className="text-sm font-medium text-text-primary">
                          {pdfOrderNumber ? `Orçamento Nº ${pdfOrderNumber} — ` : ""}
                          {parsedMedications.length} medicação(ões) identificada(s)
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-border">
                              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-2 hidden md:table-cell">
                                Código
                              </th>
                              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-2">
                                Descrição
                              </th>
                              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-2">
                                Qtd
                              </th>
                              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-2">
                                Un
                              </th>
                              <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-2 hidden sm:table-cell">
                                Vlr Unit
                              </th>
                              <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-2 hidden sm:table-cell">
                                Total
                              </th>
                              <th className="px-3 py-2 w-8">
                                <button
                                  title="Limpar lista"
                                  onClick={() => { setParsedMedications([]); if (pdfInputRef.current) pdfInputRef.current.value = ""; }}
                                  className="text-text-muted hover:text-error transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedMedications.map((med, idx) => (
                              <tr key={idx} className="border-b border-border-light last:border-0">
                                <td className="px-3 py-2 text-xs text-text-muted font-mono hidden md:table-cell">{med.product_code || "—"}</td>
                                <td className="px-3 py-2 text-text-primary max-w-[220px]">
                                  <div className="truncate" title={med.medication_name}>{med.medication_name}</div>
                                  <div className="text-xs text-text-muted">{med.supplier_name}</div>
                                </td>
                                <td className="px-3 py-2 text-text-secondary">{med.quantity}</td>
                                <td className="px-3 py-2 text-text-secondary">{med.unit}</td>
                                <td className="px-3 py-2 text-right text-text-secondary hidden sm:table-cell">
                                  {med.unit_price > 0
                                    ? med.unit_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                                    : "—"}
                                </td>
                                <td className="px-3 py-2 text-right font-medium text-text-primary hidden sm:table-cell">
                                  {med.unit_price > 0
                                    ? (med.unit_price * med.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                                    : "—"}
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={() => setParsedMedications((prev) => prev.filter((_, i) => i !== idx))}
                                    className="text-text-muted hover:text-error transition-colors"
                                    title="Remover item"
                                  >
                                    <X size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          {parsedMedications.some((m) => m.unit_price > 0) && (
                            <tfoot>
                              <tr className="border-t border-border bg-neutral-50">
                                <td colSpan={5} className="px-3 py-2 text-xs text-text-muted text-right hidden sm:table-cell">
                                  Total do pedido:
                                </td>
                                <td colSpan={3} className="px-3 py-2 text-sm font-semibold text-text-primary text-right hidden sm:table-cell">
                                  {parsedMedications
                                    .reduce((sum, m) => sum + m.unit_price * m.quantity, 0)
                                    .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </td>
                                <td className="sm:hidden px-3 py-2 text-xs text-text-muted">
                                  Total:{" "}
                                  {parsedMedications
                                    .reduce((sum, m) => sum + m.unit_price * m.quantity, 0)
                                    .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="premium"
                          onClick={confirmBatchEntry}
                          disabled={batchSubmitting}
                        >
                          <CheckCircle size={15} className="mr-1.5" />
                          {batchSubmitting ? "Registrando..." : `Confirmar Entrada (${parsedMedications.length} itens)`}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>

                <Card>
                  <h2 className="font-medium text-text-primary mb-4">Estoque de Medicações</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-text-secondary" htmlFor="stock_type">
                          Tipo
                        </label>
                        <select
                          id="stock_type"
                          className="w-full px-4 py-3 bg-white border border-border rounded-[var(--radius-md)] text-text-primary"
                          value={stockForm.movement_type}
                          onChange={(e) =>
                            setStockForm((p) => ({
                              ...p,
                              movement_type: e.target.value as "entry" | "exit",
                            }))
                          }
                        >
                          <option value="entry">Entrada</option>
                          <option value="exit">Saída</option>
                        </select>
                      </div>

                      <Input
                        id="stock_medication"
                        label="Medicação *"
                        placeholder="Ex: Semaglutida"
                        value={stockForm.medication_name}
                        onChange={(e) =>
                          setStockForm((p) => ({ ...p, medication_name: e.target.value }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        id="stock_quantity"
                        type="number"
                        min="0"
                        step="1"
                        label="Quantidade *"
                        value={stockForm.quantity}
                        onChange={(e) => setStockForm((p) => ({ ...p, quantity: e.target.value }))}
                      />
                      <Input
                        id="stock_unit"
                        label="Unidade"
                        placeholder="un, cx, fr"
                        value={stockForm.unit}
                        onChange={(e) => setStockForm((p) => ({ ...p, unit: e.target.value }))}
                      />
                      <Input
                        id="stock_date"
                        type="date"
                        label="Data"
                        value={stockForm.occurred_at}
                        onChange={(e) =>
                          setStockForm((p) => ({ ...p, occurred_at: e.target.value }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        id="stock_supplier"
                        label="Empresa Fornecedora *"
                        placeholder="Nome da empresa"
                        value={stockForm.supplier_name}
                        onChange={(e) =>
                          setStockForm((p) => ({ ...p, supplier_name: e.target.value }))
                        }
                      />
                      <Input
                        id="stock_supplier_doc"
                        label="CNPJ"
                        placeholder="00.000.000/0000-00"
                        value={stockForm.supplier_document}
                        onChange={(e) =>
                          setStockForm((p) => ({ ...p, supplier_document: e.target.value }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        id="stock_supplier_contact"
                        label="Contato"
                        placeholder="Telefone ou email"
                        value={stockForm.supplier_contact}
                        onChange={(e) =>
                          setStockForm((p) => ({ ...p, supplier_contact: e.target.value }))
                        }
                      />
                      <Input
                        id="stock_batch"
                        label="Código / Lote"
                        placeholder="Código do produto ou lote"
                        value={stockForm.batch_code}
                        onChange={(e) =>
                          setStockForm((p) => ({ ...p, batch_code: e.target.value }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        id="stock_expiry"
                        type="date"
                        label="Validade"
                        value={stockForm.expiry_date}
                        onChange={(e) =>
                          setStockForm((p) => ({ ...p, expiry_date: e.target.value }))
                        }
                      />
                      <Input
                        id="stock_notes"
                        label="Observações"
                        placeholder="Observações adicionais"
                        value={stockForm.notes}
                        onChange={(e) => setStockForm((p) => ({ ...p, notes: e.target.value }))}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button variant="premium" onClick={submitStockMovement}>
                        Registrar Movimentação
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card>
                    <h3 className="font-medium text-text-primary mb-4">Movimentações Recentes</h3>
                  {stockLoading ? (
                    <p className="text-sm text-text-muted">Carregando...</p>
                  ) : stockError ? (
                    <p className="text-sm text-error">{stockError}</p>
                  ) : stockMovements.length === 0 ? (
                    <p className="text-sm text-text-muted">Nenhuma movimentação registrada.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border-light">
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                              Medicação
                            </th>
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                              Tipo
                            </th>
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                              Quantidade
                            </th>
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                              Fornecedor
                            </th>
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                              Data
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockMovements.map((movement) => (
                            <tr key={movement.id} className="border-b border-border-light last:border-0">
                              <td className="px-2 py-3 text-sm text-text-primary">
                                {movement.medication_name}
                              </td>
                              <td className="px-2 py-3 text-sm text-text-secondary">
                                {movement.movement_type === "entry" ? "Entrada" : "Saída"}
                              </td>
                              <td className="px-2 py-3 text-sm text-text-secondary">
                                {movement.quantity} {movement.unit}
                              </td>
                              <td className="px-2 py-3 text-sm text-text-secondary">
                                <div className="font-medium text-text-primary">
                                  {movement.supplier_name}
                                </div>
                                {movement.supplier_document && (
                                  <div className="text-xs text-text-muted">
                                    {movement.supplier_document}
                                  </div>
                                )}
                              </td>
                              <td className="px-2 py-3 text-sm text-text-secondary">
                                {new Date(movement.occurred_at).toLocaleDateString("pt-BR")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            ),
          },
          {
            id: "inventario",
            label: "Inventário",
            content: (
              <div className="space-y-6">
                {/* Summary cards */}
                {!inventoryLoading && !inventoryError && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <p className="text-xs text-text-muted mb-1">Total de Itens</p>
                      <p className="text-2xl font-semibold text-text-primary">{inventory.length}</p>
                    </Card>
                    <Card>
                      <p className="text-xs text-text-muted mb-1">Em Estoque</p>
                      <p className="text-2xl font-semibold text-success">
                        {inventory.filter((i) => i.current_stock > 5).length}
                      </p>
                    </Card>
                    <Card>
                      <p className="text-xs text-text-muted mb-1">Estoque Baixo</p>
                      <p className="text-2xl font-semibold text-warning">
                        {inventory.filter((i) => i.current_stock > 0 && i.current_stock <= 5).length}
                      </p>
                    </Card>
                    <Card>
                      <p className="text-xs text-text-muted mb-1">Zerados</p>
                      <p className="text-2xl font-semibold text-error">
                        {inventory.filter((i) => i.current_stock <= 0).length}
                      </p>
                    </Card>
                  </div>
                )}

                {/* Sale form */}
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart size={16} className="text-accent-dark" />
                    <h2 className="font-medium text-text-primary">Registrar Venda / Saída para Paciente</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        id="sale_patient"
                        label="Paciente *"
                        placeholder="Nome do paciente"
                        value={saleForm.patient_name}
                        onChange={(e) => setSaleForm((p) => ({ ...p, patient_name: e.target.value }))}
                      />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-text-secondary" htmlFor="sale_medication">
                          Medicação *
                        </label>
                        <select
                          id="sale_medication"
                          className="w-full px-4 py-3 bg-white border border-border rounded-[var(--radius-md)] text-text-primary"
                          value={saleForm.medication_name}
                          onChange={(e) => setSaleForm((p) => ({ ...p, medication_name: e.target.value }))}
                        >
                          <option value="">Selecione uma medicação...</option>
                          {inventory
                            .filter((i) => i.current_stock > 0)
                            .map((i) => (
                              <option key={i.medication_name} value={i.medication_name}>
                                {i.medication_name} ({i.current_stock} {i.unit} disponível)
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        id="sale_quantity"
                        type="number"
                        min="1"
                        step="1"
                        label="Quantidade *"
                        value={saleForm.quantity}
                        onChange={(e) => setSaleForm((p) => ({ ...p, quantity: e.target.value }))}
                      />
                      <Input
                        id="sale_date"
                        type="date"
                        label="Data"
                        value={saleForm.occurred_at}
                        onChange={(e) => setSaleForm((p) => ({ ...p, occurred_at: e.target.value }))}
                      />
                      <Input
                        id="sale_notes"
                        label="Observações"
                        placeholder="Opcional"
                        value={saleForm.notes}
                        onChange={(e) => setSaleForm((p) => ({ ...p, notes: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="premium" onClick={submitSale} disabled={saleSubmitting}>
                        <ShoppingCart size={15} className="mr-1.5" />
                        {saleSubmitting ? "Registrando..." : "Confirmar Saída"}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Inventory table */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-accent-dark" />
                      <h2 className="font-medium text-text-primary">Posição de Estoque</h2>
                    </div>
                    <button
                      onClick={fetchInventory}
                      className="text-xs text-text-muted hover:text-text-primary transition-colors"
                    >
                      Atualizar
                    </button>
                  </div>

                  {inventoryLoading ? (
                    <p className="text-sm text-text-muted">Carregando...</p>
                  ) : inventoryError ? (
                    <p className="text-sm text-error">{inventoryError}</p>
                  ) : inventory.length === 0 ? (
                    <p className="text-sm text-text-muted">Nenhuma movimentação registrada ainda.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border-light">
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                              Medicação
                            </th>
                            <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                              Entradas
                            </th>
                            <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                              Saídas
                            </th>
                            <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                              Saldo
                            </th>
                            <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                              Status
                            </th>
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3 hidden md:table-cell">
                              Última Saída
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventory.map((item) => {
                            const isOut = item.current_stock <= 0;
                            const isLow = item.current_stock > 0 && item.current_stock <= 5;
                            return (
                              <tr key={item.medication_name} className="border-b border-border-light last:border-0">
                                <td className="px-2 py-3 text-text-primary font-medium max-w-[240px]">
                                  <div className="truncate" title={item.medication_name}>{item.medication_name}</div>
                                  <div className="text-xs text-text-muted">{item.unit}</div>
                                </td>
                                <td className="px-2 py-3 text-right text-success">{item.total_entries}</td>
                                <td className="px-2 py-3 text-right text-error">{item.total_exits}</td>
                                <td className={`px-2 py-3 text-right font-semibold ${isOut ? "text-error" : isLow ? "text-warning" : "text-success"}`}>
                                  {item.current_stock} {item.unit}
                                </td>
                                <td className="px-2 py-3 text-center">
                                  {isOut ? (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-error/10 text-error">
                                      <AlertTriangle size={10} /> Zerado
                                    </span>
                                  ) : isLow ? (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                                      <AlertTriangle size={10} /> Baixo
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                                      <CheckCircle size={10} /> OK
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-3 text-text-muted text-xs hidden md:table-cell">
                                  {item.last_exit_at
                                    ? new Date(item.last_exit_at).toLocaleDateString("pt-BR")
                                    : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            ),
          },
        ]}
      />

      <Card>
        <h2 className="font-medium text-text-primary mb-4">Lançamentos Recentes</h2>
        {loading ? (
          <p className="text-sm text-text-muted">Carregando...</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-text-muted">Nenhum lançamento registrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                    Tipo
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                    Categoria
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                    Descrição
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                    Data
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-3">
                    Valor
                  </th>
                  <th className="px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-border-light last:border-0">
                    <td className="px-2 py-3 text-sm text-text-primary">
                      {record.record_type === "invoice" ? "Nota Fiscal" : record.transaction_type === "entry" ? "Entrada" : "Saída"}
                    </td>
                    <td className="px-2 py-3 text-sm text-text-secondary">{record.category || "—"}</td>
                    <td className="px-2 py-3 text-sm text-text-secondary">{record.description || "—"}</td>
                    <td className="px-2 py-3 text-sm text-text-secondary">
                      {new Date(record.occurred_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td
                      className={`px-2 py-3 text-sm text-right font-medium ${
                        record.record_type === "cashflow" && record.transaction_type === "exit"
                          ? "text-error"
                          : "text-success"
                      }`}
                    >
                      {Number(record.amount || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button
                        onClick={() => openDelete(record)}
                        className="text-text-muted hover:text-error transition-colors p-1 rounded"
                        title="Excluir registro"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {error && (
        <Card className="border border-error/20 bg-error/5">
          <p className="text-sm text-error">{error}</p>
        </Card>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[var(--radius-xl)] shadow-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <Trash2 size={18} className="text-error" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Excluir registro</h3>
                <p className="text-sm text-text-secondary mt-1">
                  {deleteTarget.record_type === "invoice" ? "Nota Fiscal" : deleteTarget.transaction_type === "entry" ? "Entrada" : "Saída"}
                  {" — "}
                  {Number(deleteTarget.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary" htmlFor="delete_password">
                Confirme sua senha para excluir
              </label>
              <input
                ref={passwordInputRef}
                id="delete_password"
                type="password"
                placeholder="••••••••"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmDelete()}
                className="w-full px-4 py-3 border border-border rounded-[var(--radius-md)] text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
              />
              {deleteError && (
                <p className="text-xs text-error mt-1">{deleteError}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={closeDelete}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-[var(--radius-md)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading || !deletePassword}
                className="px-4 py-2 text-sm font-medium text-white bg-error rounded-[var(--radius-md)] hover:bg-error/90 disabled:opacity-50 transition-colors"
              >
                {deleteLoading ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
