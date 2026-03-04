"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Users, Calendar, Activity, FileText, Clock } from "lucide-react";

const DashboardCharts = dynamic(
  () => import("./_components/DashboardCharts").then((m) => m.DashboardCharts),
  { ssr: false, loading: () => <div className="mt-10 h-48 rounded-2xl bg-surface animate-pulse" /> }
);

interface AdminStats {
  totalPatients: number;
  todayServices: number;
  monthlyBioimpedance: number;
  recentDocuments: number;
  recentActivity: {
    id: string;
    action: string;
    entity_type: string;
    created_at: string;
    profiles?: { full_name: string };
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");

        const _data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao carregar estatísticas"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statsCards = [
    {
      icon: Users,
      label: "Total de Pacientes",
      value: stats?.totalPatients.toString() || "0",
      description: "Pacientes cadastrados",
    },
    {
      icon: Calendar,
      label: "Consultas Hoje",
      value: stats?.todayServices.toString() || "0",
      description: "Agendadas para hoje",
    },
    {
      icon: Activity,
      label: "Bioimpedâncias",
      value: stats?.monthlyBioimpedance.toString() || "0",
      description: "Registros este mês",
    },
    {
      icon: FileText,
      label: "Documentos",
      value: stats?.recentDocuments.toString() || "0",
      description: "Uploads este mês",
    },
  ];

  const actionLabels: Record<string, string> = {
    created: "Criou",
    updated: "Atualizou",
    deleted: "Removeu",
  };

  const entityLabels: Record<string, string> = {
    anamnesis: "anamnese",
    bioimpedance: "bioimpedância",
    prescription: "prescrição",
    document: "documento",
    patient: "paciente",
    service: "serviço",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
          DASHBOARD
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Visão geral do consultório.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : error ? (
          <div className="col-span-full text-center py-8">
            <p className="text-error text-sm">{error}</p>
          </div>
        ) : (
          statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} hover>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-accent-gold/10 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-accent-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">{card.label}</p>
                    <p className="text-2xl font-semibold text-text-primary">
                      {card.value}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Charts */}
      {!loading && !error && <DashboardCharts />}

      {/* Recent Activity */}
      <Card>
        <h2 className="font-medium text-text-primary mb-4">
          Atividade Recente
        </h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-surface rounded-[var(--radius-md)] animate-pulse"
              />
            ))}
          </div>
        ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 px-4 py-3 bg-surface/50 rounded-[var(--radius-md)]"
              >
                <Clock size={16} className="text-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    <span className="font-medium">
                      {activity.profiles?.full_name || "Sistema"}
                    </span>{" "}
                    {actionLabels[activity.action] || activity.action}{" "}
                    {entityLabels[activity.entity_type] || activity.entity_type}
                  </p>
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {new Date(activity.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-muted text-sm">
              Nenhuma atividade registrada.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
