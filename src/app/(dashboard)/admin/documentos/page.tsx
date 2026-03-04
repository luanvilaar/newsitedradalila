"use client";

import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SkeletonCard } from "@/components/ui/Skeleton";
import {
  Upload,
  FileText,
  File,
  X,
  Search,
  Download,
} from "lucide-react";

interface DocumentRecord {
  id: string;
  patient_id: string;
  type: string;
  title: string;
  description: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export default function DocumentosPage() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Upload metadata
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMeta, setUploadMeta] = useState({
    patientId: "",
    type: "exam" as string,
    title: "",
    description: "",
  });

  // Patients for the selector
  const [patients, setPatients] = useState<
    { id: string; full_name: string }[]
  >([]);

  useEffect(() => {
    fetchDocuments();
    fetchPatients();
  }, []);

  async function fetchDocuments() {
    try {
      setLoading(true);
      // Use admin stats or a dedicated endpoint
      // For now, fetch all patient documents by iterating
      // Actually we need a general documents list endpoint for admins
      // Let's create a simple fetch by querying all documents
      const res = await fetch("/api/documents");
      if (res.ok) {
        const _data = await res.json();
        setDocuments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPatients() {
    try {
      const res = await fetch("/api/patients");
      if (res.ok) {
        const _data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((p: unknown) => ({
          id: p.id,
          full_name: p.profiles?.full_name || "Sem nome",
        }));
        setPatients(mapped);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  }

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
        f.type === "application/pdf" || f.type.startsWith("image/")
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

  async function handleUpload() {
    if (files.length === 0) return;

    if (!uploadMeta.patientId || !uploadMeta.title || !uploadMeta.type) {
      setShowUploadModal(true);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("patientId", uploadMeta.patientId);
        formData.append("type", uploadMeta.type);
        formData.append("title", uploadMeta.title || file.name);
        formData.append("description", uploadMeta.description);

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const _data = await res.json();
          throw new Error(data.error || `Erro ao enviar ${file.name}`);
        }
      }

      setFiles([]);
      setShowUploadModal(false);
      setUploadMeta({ patientId: "", type: "exam", title: "", description: "" });
      fetchDocuments();
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Erro ao fazer upload"
      );
    } finally {
      setUploading(false);
    }
  }

  const filteredDocs = documents.filter(
    (d) =>
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.file_name?.toLowerCase().includes(search.toLowerCase())
  );

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

            {uploadError && (
              <p className="text-sm text-error">{uploadError}</p>
            )}

            <Button
              variant="premium"
              onClick={() => setShowUploadModal(true)}
              className="mt-4 gap-2"
              disabled={uploading}
            >
              <Upload size={16} />
              {uploading
                ? "Enviando..."
                : `Fazer Upload (${files.length} arquivo${files.length !== 1 ? "s" : ""})`}
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

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid gap-4">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} hover>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-accent-gold/10 flex items-center justify-center shrink-0">
                    {doc.mime_type === "application/pdf" ? (
                      <FileText size={20} className="text-error" />
                    ) : (
                      <File size={20} className="text-accent-gold" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {doc.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      {doc.file_name} &middot;{" "}
                      {doc.file_size
                        ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB`
                        : ""}{" "}
                      &middot;{" "}
                      {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-text-muted px-2 py-1 bg-surface rounded-[var(--radius-sm)]">
                  {doc.type}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
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
            </p>
          </div>
        </Card>
      )}

      {/* Upload Metadata Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Detalhes do Upload"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              Paciente *
            </label>
            <select
              value={uploadMeta.patientId}
              onChange={(e) =>
                setUploadMeta((p) => ({ ...p, patientId: e.target.value }))
              }
              className="w-full px-4 py-3 bg-white border border-border rounded-[var(--radius-md)] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all"
            >
              <option value="">Selecione o paciente</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              Tipo *
            </label>
            <select
              value={uploadMeta.type}
              onChange={(e) =>
                setUploadMeta((p) => ({ ...p, type: e.target.value }))
              }
              className="w-full px-4 py-3 bg-white border border-border rounded-[var(--radius-md)] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all"
            >
              <option value="exam">Exame</option>
              <option value="report">Laudo</option>
              <option value="prescription">Prescrição</option>
              <option value="image">Imagem</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <Input
            id="upload_title"
            label="Título *"
            placeholder="Nome do documento"
            value={uploadMeta.title}
            onChange={(e) =>
              setUploadMeta((p) => ({ ...p, title: e.target.value }))
            }
          />

          <Input
            id="upload_description"
            label="Descrição"
            placeholder="Descrição opcional"
            value={uploadMeta.description}
            onChange={(e) =>
              setUploadMeta((p) => ({ ...p, description: e.target.value }))
            }
          />

          {uploadError && (
            <p className="text-sm text-error">{uploadError}</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="premium"
              onClick={handleUpload}
              disabled={uploading || !uploadMeta.patientId || !uploadMeta.title}
            >
              {uploading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
