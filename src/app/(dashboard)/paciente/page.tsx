"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";
import { Calendar, Pill, Activity, ClipboardList } from "lucide-react";

interface SummaryCardData {
  nextAppointment?: string;
  activeMedications: number;
  lastBioimpedance?: string;
  contractedServices: number;
}

export default function PatientDashboard() {
  const [data, setData] = useState<SummaryCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatientData() {
      try {
        // Fetch all data in parallel - don't fail if one request fails
        const [patientRes, prescriptionsRes, bioRes, servicesRes] =
          await Promise.allSettled([
            fetch("/api/patients/current"),
            fetch("/api/patients/current/prescriptions"),
            fetch("/api/patients/current/bioimpedance"),
            fetch("/api/patients/current/services"),
          ]);

        const prescriptions =
          prescriptionsRes.status === "fulfilled" && prescriptionsRes.value.ok
            ? await prescriptionsRes.value.json()
            : [];

        const bioRecords =
          bioRes.status === "fulfilled" && bioRes.value.ok
            ? await bioRes.value.json()
            : [];

        const services =
          servicesRes.status === "fulfilled" && servicesRes.value.ok
            ? await servicesRes.value.json()
            : [];

        const activeMeds = Array.isArray(prescriptions)
          ? prescriptions.filter(
              (p: any) => p.type === "medication" && p.status === "active"
            ).length
          : 0;

        const latestBio =
          Array.isArray(bioRecords) && bioRecords.length > 0
            ? bioRecords[0]
            : null;

        setData({
          activeMedications: activeMeds,
          lastBioimpedance: latestBio
            ? new Date(latestBio.measurement_date).toLocaleDateString("pt-BR")
            : undefined,
          contractedServices: Array.isArray(services) ? services.length : 0,
        });
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    fetchPatientData();
  }, []);

  const summaryCards = [
    {
      icon: Calendar,
      label: "Próxima Consulta",
      value: data?.nextAppointment || "—",
      description: "Nenhuma consulta agendada",
    },
    {
      icon: Pill,
      label: "Medicamentos Ativos",
      value: data?.activeMedications.toString() || "0",
      description: "Prescrições em andamento",
    },
    {
      icon: Activity,
      label: "Última Bioimpedância",
      value: data?.lastBioimpedance || "—",
      description: "Nenhum registro ainda",
    },
    {
      icon: ClipboardList,
      label: "Serviços Contratados",
      value: data?.contractedServices.toString() || "0",
      description: "Pacotes ativos",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
          VISÃO GERAL
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Bem-vindo(a) à sua área de acompanhamento.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : error ? (
          <div className="col-span-full text-center py-8">
            <p className="text-error text-sm">{error}</p>
          </div>
        ) : (
          summaryCards.map((card) => {
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
      <Card>
        <h2 className="font-medium text-text-primary mb-4">
          Atividade Recente
        </h2>
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">
            Nenhuma atividade registrada ainda.
          </p>
          <p className="text-text-muted text-xs mt-2">
            Seus dados aparecerão aqui conforme seu acompanhamento avançar.
          </p>
        </div>
      </Card>
    </div>
  );
}
