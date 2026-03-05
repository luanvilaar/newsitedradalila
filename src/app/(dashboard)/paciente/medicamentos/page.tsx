"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";
import { Pill } from "lucide-react";

interface Medication {
  id: string;
  medication_name?: string;
  dosage?: string;
  frequency?: string;
  status: string;
  details?: {
    name?: string;
    dosage?: string;
    frequency?: string;
    instructions?: string;
  };
}

export default function MedicamentosPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedications() {
      try {
        const res = await fetch("/api/patients/current/prescriptions");
        if (!res.ok) throw new Error("Failed to fetch medications");

        const prescriptions = await res.json();

        // Filter for medication prescriptions
        const meds = prescriptions.filter(
          (p: { type?: string }) => p.type === "medication"
        ) as Medication[];

        setMedications(meds);
      } catch (err) {
        console.error("Error fetching medications:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar medicamentos");
      } finally {
        setLoading(false);
      }
    }

    fetchMedications();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
          MEDICAMENTOS
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Suas prescrições de medicamentos e suplementos.
        </p>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <Card className="border border-error/20 bg-error/5">
          <p className="text-error text-sm">{error}</p>
        </Card>
      ) : medications.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
              <Pill size={28} className="text-text-muted" />
            </div>
            <p className="text-text-secondary text-sm font-medium">
              Nenhum medicamento prescrito
            </p>
            <p className="text-text-muted text-xs mt-2 max-w-sm mx-auto">
              Suas medicações ativas, dosagens e instruções aparecerão aqui.
            </p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Medicamento
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Dosagem
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Frequência
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {medications.map((med) => (
                  <tr
                    key={med.id}
                    className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">
                      {med.medication_name || med.details?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {med.dosage || med.details?.dosage || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {med.frequency || med.details?.frequency || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-full)] text-xs font-medium ${
                          med.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-text-muted/10 text-text-muted"
                        }`}
                      >
                        {med.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
