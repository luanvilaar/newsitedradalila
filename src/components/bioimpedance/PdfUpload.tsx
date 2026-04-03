"use client";

import { useState } from "react";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";

interface PdfUploadProps {
  patientId: string;
  onDataExtracted: (
    data: Record<string, string | number | null | undefined>,
    meta?: {
      examId?: string;
      extractedFields?: string[];
      parserStatus?: "success" | "empty" | "failed";
    }
  ) => void;
  isLoading?: boolean;
  onProcessingChange?: (processing: boolean) => void;
}

export function PdfUploadBioimpedance({
  patientId,
  onDataExtracted,
  isLoading = false,
  onProcessingChange,
}: PdfUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function processPdf(file: File) {
    if (!file.type.includes("pdf")) {
      setError("Por favor, selecione um arquivo PDF");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Arquivo muito grande (máximo 10MB)");
      return;
    }

    setIsProcessing(true);
    onProcessingChange?.(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientId", patientId);
      formData.append("keepHistory", "true");

      const response = await fetch(`/api/bioimpedance/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const detailSuffix = errorData.details ? ` (${errorData.details})` : "";
        throw new Error((errorData.error || "Erro ao processar PDF") + detailSuffix);
      }

      const result = await response.json();

      if (result.data) {
        onDataExtracted(result.data, {
          examId: result.exam?.id,
          extractedFields: Array.isArray(result.extractedFields)
            ? result.extractedFields
            : [],
          parserStatus: result.exam?.parser_status,
        });
        setSuccess(
          result.message || "PDF processado com sucesso! Revise os dados."
        );
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao processar arquivo";
      setError(message);
      console.error("PDF processing error:", err);
    } finally {
      setIsProcessing(false);
      onProcessingChange?.(false);
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === "dragenter" || e.type === "dragover");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processPdf(files[0]);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      processPdf(files[0]);
    }
  }

  return (
    <div className="mb-6">
      <label className="text-sm font-medium text-text-primary mb-3 block">
        📄 Importar dados de Bioimpedância (PDF)
      </label>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            isDragActive
              ? "border-accent-gold bg-accent-gold/5"
              : "border-border-light hover:border-accent-gold/30"
          }
          ${isProcessing ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          disabled={isProcessing || isLoading}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        <Upload
          size={32}
          className="mx-auto mb-3 text-text-muted"
        />
        <p className="font-medium text-text-primary mb-1">
          {isProcessing ? "Processando..." : "Arraste um PDF aqui ou clique"}
        </p>
        <p className="text-sm text-text-secondary">
          Arquivo de relatório de bioimpedância (máx. 10MB)
        </p>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-3 flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
    </div>
  );
}
