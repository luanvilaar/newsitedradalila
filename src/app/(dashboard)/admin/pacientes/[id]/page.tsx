"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { SkeletonCard } from "@/components/ui/Skeleton";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Activity,
  Pill,
  Utensils,
  Dumbbell,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface PatientData {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  cpf?: string;
  birth_date?: string;
  address?: string;
  profiles?: {
    full_name: string;
  };
}

function OverviewTab({ patientId, patient }: { patientId: string; patient: PatientData | null }) {
  if (!patient) return <SkeletonCard />;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <h3 className="font-medium text-text-primary mb-4">
          Dados Pessoais
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Phone size={16} className="text-text-muted" />
            <span className="text-text-secondary">{patient.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail size={16} className="text-text-muted" />
            <span className="text-text-secondary">{patient.email || "—"}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="text-text-muted" />
            <span className="text-text-secondary">{patient.address || "—"}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar size={16} className="text-text-muted" />
            <span className="text-text-secondary">
              {patient.birth_date
                ? new Date(patient.birth_date).toLocaleDateString("pt-BR")
                : "—"}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-medium text-text-primary mb-4">
          Resumo Rápido
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Consultas realizadas</span>
            <span className="font-medium text-text-primary">0</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Prescrições ativas</span>
            <span className="font-medium text-text-primary">0</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Registros de bioimpedância</span>
            <span className="font-medium text-text-primary">0</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Documentos</span>
            <span className="font-medium text-text-primary">0</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AnamneseTab({ patientId }: { patientId: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text-primary">Anamnese</h3>
        <Link href={`/admin/pacientes/${patientId}/anamnese`}>
          <Button variant="premium" size="sm">
            Nova Anamnese
          </Button>
        </Link>
      </div>
      <Card>
        <div className="text-center py-8">
          <FileText size={28} className="mx-auto text-text-muted mb-2" />
          <p className="text-text-muted text-sm">Nenhuma anamnese registrada.</p>
        </div>
      </Card>
    </div>
  );
}

function BioimpedanciaTab({ patientId }: { patientId: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text-primary">Bioimpedância</h3>
        <Link href={`/admin/pacientes/${patientId}/bioimpedancia`}>
          <Button variant="premium" size="sm">
            Novo Registro
          </Button>
        </Link>
      </div>
      <Card>
        <div className="text-center py-8">
          <Activity size={28} className="mx-auto text-text-muted mb-2" />
          <p className="text-text-muted text-sm">Nenhum registro de bioimpedância.</p>
        </div>
      </Card>
    </div>
  );
}

function PrescricoesTab({ patientId }: { patientId: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text-primary">Prescrições</h3>
        <Link href={`/admin/pacientes/${patientId}/prescricoes`}>
          <Button variant="premium" size="sm">
            Nova Prescrição
          </Button>
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center py-6">
            <Pill size={24} className="mx-auto text-text-muted mb-2" />
            <p className="text-xs text-text-muted">Medicamentos</p>
            <p className="text-lg font-semibold text-text-primary">0</p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-6">
            <Utensils size={24} className="mx-auto text-text-muted mb-2" />
            <p className="text-xs text-text-muted">Dietas</p>
            <p className="text-lg font-semibold text-text-primary">0</p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-6">
            <Dumbbell size={24} className="mx-auto text-text-muted mb-2" />
            <p className="text-xs text-text-muted">Treinos</p>
            <p className="text-lg font-semibold text-text-primary">0</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HistoricoTab({ patientId }: { patientId: string }) {
  return (
    <div>
      <h3 className="font-medium text-text-primary mb-4">Histórico</h3>
      <Card>
        <div className="text-center py-8">
          <Clock size={28} className="mx-auto text-text-muted mb-2" />
          <p className="text-text-muted text-sm">Nenhuma atividade registrada.</p>
        </div>
      </Card>
    </div>
  );
}

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await fetch(`/api/patients/${patientId}`);
        if (!res.ok) throw new Error("Failed to fetch patient");

        const data = await res.json();
        setPatient(data);
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar dados do paciente");
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/pacientes">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
            {loading ? "..." : patient?.full_name || "PACIENTE"}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Detalhes e acompanhamento
          </p>
        </div>
      </div>

      {error && (
        <Card className="mb-8 border border-error/20 bg-error/5">
          <p className="text-error text-sm">{error}</p>
        </Card>
      )}

      {/* Tabs */}
      {loading ? (
        <div className="grid gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <Tabs
          tabs={[
            {
              id: "overview",
              label: "Visão Geral",
              content: <OverviewTab patientId={patientId} patient={patient} />,
            },
            {
              id: "anamnese",
              label: "Anamnese",
              content: <AnamneseTab patientId={patientId} />,
            },
            {
              id: "bioimpedancia",
              label: "Bioimpedância",
              content: <BioimpedanciaTab patientId={patientId} />,
            },
            {
              id: "prescricoes",
              label: "Prescrições",
              content: <PrescricoesTab patientId={patientId} />,
            },
            {
              id: "historico",
              label: "Histórico",
              content: <HistoricoTab patientId={patientId} />,
            },
          ]}
        />
      )}
    </div>
  );
}
