"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { FileText, Download } from "lucide-react";

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
  parsed_data?: any;
}

export default function ExamesPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch("/api/patients/current/documents");
        if (!res.ok) {
          // Don't throw - just show empty state
          setDocuments([]);
          return;
        }

        const docs = await res.json();
        setDocuments(Array.isArray(docs) ? docs : []);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  const downloadDocument = (filePath: string, fileName: string) => {
    // In a real app, this would use Supabase Storage signed URLs
    // For now, just show a placeholder
    console.log(`Downloading: ${fileName} from ${filePath}`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
          EXAMES
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Seus exames solicitados e resultados.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <Card className="border border-error/20 bg-error/5">
          <p className="text-error text-sm">{error}</p>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
              <FileText size={28} className="text-text-muted" />
            </div>
            <p className="text-text-secondary text-sm font-medium">
              Nenhum exame registrado
            </p>
            <p className="text-text-muted text-xs mt-2 max-w-sm mx-auto">
              Seus exames solicitados, resultados e documentos aparecerão aqui.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} hover>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-accent-gold/10 flex items-center justify-center shrink-0 mt-1">
                    <FileText size={20} className="text-accent-gold" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary text-sm">
                      {doc.file_name}
                    </h3>
                    <p className="text-xs text-text-muted mt-1">
                      {doc.file_type.toUpperCase()} •{" "}
                      {new Date(doc.uploaded_at).toLocaleDateString("pt-BR")}
                    </p>
                    {doc.parsed_data && (
                      <p className="text-xs text-text-secondary mt-2 max-w-md line-clamp-2">
                        {doc.parsed_data}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => downloadDocument(doc.file_path, doc.file_name)}
                  className="p-2 hover:bg-surface rounded-[var(--radius-md)] transition-colors shrink-0"
                  title="Download"
                >
                  <Download size={18} className="text-accent-gold" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
