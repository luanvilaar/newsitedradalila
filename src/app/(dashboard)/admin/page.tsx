"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Users, Calendar, Activity, FileText } from "lucide-react";

interface AdminStats {
  totalPatients: number;
  todayServices: number;
  monthlyBioimpedance: number;
  recentDocuments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalPatients: 0,
    todayServices: 0,
    monthlyBioimpedance: 0,
    recentDocuments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch all patients
        const patientsRes = await fetch("/api/patients");
        const patients = patientsRes.ok ? await patientsRes.json() : [];

        setStats({
          totalPatients: Array.isArray(patients) ? patients.length : 0,
          todayServices: 0, // Would need service filtering by date
          monthlyBioimpedance: 0, // Would need bioimpedance filtering
          recentDocuments: 0, // Would need document tracking
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas");
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
      value: stats.totalPatients.toString(),
      description: "Pacientes cadastrados",
    },
    {
      icon: Calendar,
      label: "Consultas Hoje",
      value: stats.todayServices.toString(),
      description: "Agendadas para hoje",
    },
    {
      icon: Activity,
      label: "Bioimpedâncias",
      value: stats.monthlyBioimpedance.toString(),
      description: "Registros este mês",
    },
    {
      icon: FileText,
      label: "Documentos",
      value: stats.recentDocuments.toString(),
      description: "Uploads recentes",
    },
  ];

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

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-medium text-text-primary mb-4">
            Próximas Consultas
          </h2>
          <div className="text-center py-8">
            <p className="text-text-muted text-sm">
              Nenhuma consulta agendada.
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="font-medium text-text-primary mb-4">
            Atividade Recente
          </h2>
          <div className="text-center py-8">
            <p className="text-text-muted text-sm">
              Nenhuma atividade registrada.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
