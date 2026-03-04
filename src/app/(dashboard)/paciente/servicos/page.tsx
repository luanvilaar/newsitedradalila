"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ClipboardList, CheckCircle, Clock } from "lucide-react";

interface Service {
  id: string;
  service_type: string;
  service_name: string;
  status: string;
  scheduled_date?: string;
  completed_date?: string;
  details?: unknown;
}

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/patients/current/services");
        if (!res.ok) throw new Error("Failed to fetch services");

        const _data = await res.json();
        setServices(data);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar serviços");
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  const getStatusIcon = (status: string) => {
    if (status === "completed") {
      return <CheckCircle size={18} className="text-success" />;
    }
    if (status === "scheduled") {
      return <Clock size={18} className="text-accent-gold" />;
    }
    return <Clock size={18} className="text-text-muted" />;
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      scheduled: "Agendado",
      completed: "Concluído",
      cancelled: "Cancelado",
      pending: "Pendente",
    };
    return statusMap[status] || status;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
          SERVIÇOS
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Seus serviços contratados e histórico de consultas.
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
      ) : services.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
              <ClipboardList size={28} className="text-text-muted" />
            </div>
            <p className="text-text-secondary text-sm font-medium">
              Nenhum serviço registrado
            </p>
            <p className="text-text-muted text-xs mt-2 max-w-sm mx-auto">
              Seus pacotes de acompanhamento, consultas e procedimentos aparecerão aqui.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {services.map((service) => (
            <Card key={service.id} hover>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1 shrink-0">
                    {getStatusIcon(service.status)}
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary text-sm">
                      {service.service_name}
                    </h3>
                    <p className="text-xs text-text-muted mt-1">
                      {service.service_type}
                    </p>
                    {service.scheduled_date && (
                      <p className="text-xs text-text-secondary mt-2">
                        Agendado para{" "}
                        {new Date(service.scheduled_date).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    )}
                    {service.completed_date && (
                      <p className="text-xs text-success mt-2">
                        Concluído em{" "}
                        {new Date(service.completed_date).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-[var(--radius-full)] text-xs font-medium whitespace-nowrap shrink-0">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      service.status === "completed"
                        ? "bg-success"
                        : service.status === "scheduled"
                          ? "bg-accent-gold"
                          : "bg-text-muted"
                    }`}
                  />
                  {getStatusLabel(service.status)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
