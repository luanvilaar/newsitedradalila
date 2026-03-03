"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Upload,
  FileText,
  File,
  X,
  Search,
} from "lucide-react";

export default function DocumentosPage() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [search, setSearch] = useState("");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) =>
        f.type === "application/pdf" ||
        f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selected = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...selected]);
      }
    },
    []
  );

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleUpload() {
    // TODO: Upload to Supabase Storage
    console.log("Uploading files:", files);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
          DOCUMENTOS
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Upload e gerenciamento de documentos e exames.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="mb-8">
        <h2 className="font-medium text-text-primary mb-4">
          Upload de Documentos
        </h2>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-[var(--radius-xl)] p-12 text-center transition-colors ${
            dragActive
              ? "border-accent-gold bg-accent-gold/5"
              : "border-border hover:border-accent-gold/50"
          }`}
        >
          <Upload
            size={40}
            className={`mx-auto mb-4 ${
              dragActive ? "text-accent-gold" : "text-text-muted"
            }`}
          />
          <p className="text-text-secondary text-sm mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-text-muted text-xs mb-4">
            PDF, PNG, JPG (máx. 10MB por arquivo)
          </p>
          <label>
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileInput}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-[var(--radius-md)] border border-border text-text-primary bg-transparent hover:bg-surface transition-all duration-300 cursor-pointer">
              Selecionar Arquivos
            </span>
          </label>
        </div>

        {/* Queued files */}
        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">
              Arquivos selecionados ({files.length})
            </h3>
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between px-4 py-3 bg-surface rounded-[var(--radius-md)]"
              >
                <div className="flex items-center gap-3">
                  {file.type === "application/pdf" ? (
                    <FileText size={18} className="text-error" />
                  ) : (
                    <File size={18} className="text-accent-gold" />
                  )}
                  <div>
                    <p className="text-sm text-text-primary">{file.name}</p>
                    <p className="text-xs text-text-muted">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-text-muted hover:text-error transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <Button
              variant="premium"
              onClick={handleUpload}
              className="mt-4 gap-2"
            >
              <Upload size={16} />
              Fazer Upload ({files.length} arquivo{files.length !== 1 ? "s" : ""})
            </Button>
          </div>
        )}
      </Card>

      {/* Documents List */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Buscar documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-[var(--radius-md)] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all"
          />
        </div>
      </div>

      <Card>
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
            <FileText size={28} className="text-text-muted" />
          </div>
          <p className="text-text-secondary text-sm font-medium">
            Nenhum documento enviado
          </p>
          <p className="text-text-muted text-xs mt-2 max-w-sm mx-auto">
            Faça upload de exames, laudos e outros documentos dos pacientes.
            PDFs serão analisados automaticamente.
          </p>
        </div>
      </Card>
    </div>
  );
}
