"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Users, Search, Plus, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Patient {
  id: string;
  full_name: string;
  phone: string;
  status: string;
  last_visit?: string;
}

export default function PacientesListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch("/api/patients");
        if (!res.ok) throw new Error("Failed to fetch patients");

        const data = await res.json();
        setPatients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar pacientes");
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  const filtered = patients.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
            PACIENTES
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Gerencie seus pacientes.
          </p>
        </div>
        <Button variant="premium" className="gap-2">
          <Plus size={16} />
          Novo Paciente
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-[var(--radius-md)] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all"
          />
        </div>
      </div>

      {/* Patient Table */}
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <Card className="border border-error/20 bg-error/5">
          <p className="text-error text-sm">{error}</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Nome
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Telefone
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Última Visita
                  </th>
                  <th className="text-right px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/pacientes/${patient.id}`}
                        className="text-sm font-medium text-text-primary hover:text-accent-gold transition-colors"
                      >
                        {patient.full_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {patient.phone || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-full)] text-xs font-medium ${
                          patient.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-text-muted/10 text-text-muted"
                        }`}
                      >
                        {patient.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {patient.last_visit
                        ? new Date(patient.last_visit).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/pacientes/${patient.id}`}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical size={16} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users size={32} className="mx-auto text-text-muted mb-3" />
              <p className="text-text-secondary text-sm">
                {search ? "Nenhum paciente encontrado." : "Nenhum paciente cadastrado."}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
