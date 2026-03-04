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
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

const PatientOverviewCharts = dynamic(
  () =>
    import("@/components/patient/PatientOverviewCharts").then(
      (m) => m.PatientOverviewCharts
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mt-8 h-40 rounded-2xl bg-surface animate-pulse" />
    ),
  }
);

interface PatientData {
  id: string;
  status: string;
  address?: any;
  notes?: string;
  profiles?: {
    full_name: string;
    phone: string;
    cpf?: string;
    birth_date?: string;
    avatar_url?: string;
  };
}

function OverviewTab({
  patientId,
  patient,
}: {
  patientId: string;
  patient: PatientData | null;
}) {
  const [counts, setCounts] = useState({
    prescriptions: 0,
    bioimpedance: 0,
    documents: 0,
    anamnesis: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      const [prescRes, bioRes, docsRes, anamRes] = await Promise.allSettled([
        fetch(`/api/patients/${patientId}/prescriptions`),
        fetch(`/api/patients/${patientId}/bioimpedance`),
        fetch(`/api/patients/${patientId}/documents`),
        fetch(`/api/patients/${patientId}/anamnesis`),
      ]);

      const presc =
        prescRes.status === "fulfilled" && prescRes.value.ok
          ? await prescRes.value.json()
          : [];
      const bio =
        bioRes.status === "fulfilled" && bioRes.value.ok
          ? await bioRes.value.json()
          : [];
      const docs =
        docsRes.status === "fulfilled" && docsRes.value.ok
          ? await docsRes.value.json()
          : [];
      const anam =
        anamRes.status === "fulfilled" && anamRes.value.ok
          ? await anamRes.value.json()
          : [];

      setCounts({
        prescriptions: Array.isArray(presc)
          ? presc.filter((p: any) => p.status === "active").length
          : 0,
        bioimpedance: Array.isArray(bio) ? bio.length : 0,
        documents: Array.isArray(docs) ? docs.length : 0,
        anamnesis: Array.isArray(anam) ? anam.length : 0,
      });
    }

    fetchCounts();
  }, [patientId]);

  if (!patient) return <SkeletonCard />;

  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
        <h3 className="font-medium text-text-primary mb-4">Dados Pessoais</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Phone size={16} className="text-text-muted" />
            <span className="text-text-secondary">
              {patient.profiles?.phone || "—"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <FileText size={16} className="text-text-muted" />
            <span className="text-text-secondary">
              CPF: {patient.profiles?.cpf || "—"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="text-text-muted" />
            <span className="text-text-secondary">
              {typeof patient.address === "string"
                ? patient.address
                : patient.address
                  ? `${patient.address.street}, ${patient.address.number}${patient.address.complement ? `, ${patient.address.complement}` : ""} - ${patient.address.neighborhood}, ${patient.address.city}, ${patient.address.state}`
                  : "—"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar size={16} className="text-text-muted" />
            <span className="text-text-secondary">
              {patient.profiles?.birth_date
                ? new Date(patient.profiles.birth_date).toLocaleDateString(
                    "pt-BR"
                  )
                : "—"}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-medium text-text-primary mb-4">Resumo Rápido</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Anamneses</span>
            <span className="font-medium text-text-primary">
              {counts.anamnesis}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Prescrições ativas</span>
            <span className="font-medium text-text-primary">
              {counts.prescriptions}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              Registros de bioimpedância
            </span>
            <span className="font-medium text-text-primary">
              {counts.bioimpedance}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Documentos</span>
            <span className="font-medium text-text-primary">
              {counts.documents}
            </span>
          </div>
        </div>
      </Card>
      </div>

      <OverviewChartsSection patientId={patientId} />
    </div>
  );
}

function OverviewChartsSection({ patientId }: { patientId: string }) {
  return <PatientOverviewCharts patientId={patientId} />;
}

function AnamneseTab({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(`/api/patients/${patientId}/anamnesis`);
        if (res.ok) {
          const data = await res.json();
          setRecords(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [patientId]);

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

      {loading ? (
        <SkeletonCard />
      ) : records.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <FileText size={28} className="mx-auto text-text-muted mb-2" />
            <p className="text-text-muted text-sm">
              Nenhuma anamnese registrada.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <Card key={rec.id} hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {rec.chief_complaint || "Sem queixa principal"}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {new Date(rec.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {rec.history_present_illness && (
                    <p className="text-xs text-text-secondary mt-2 line-clamp-2">
                      {rec.history_present_illness}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function BioimpedanciaTab({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(`/api/patients/${patientId}/bioimpedance`);
        if (res.ok) {
          const data = await res.json();
          setRecords(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [patientId]);

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

      {loading ? (
        <SkeletonCard />
      ) : records.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Activity size={28} className="mx-auto text-text-muted mb-2" />
            <p className="text-text-muted text-sm">
              Nenhum registro de bioimpedância.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Latest metrics summary */}
          {records[0] && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Card>
                <p className="text-xs text-text-muted">Peso</p>
                <p className="text-xl font-semibold text-text-primary">
                  {records[0].weight} kg
                </p>
              </Card>
              <Card>
                <p className="text-xs text-text-muted">Gordura Corporal</p>
                <p className="text-xl font-semibold text-text-primary">
                  {records[0].body_fat_percentage || "—"}%
                </p>
              </Card>
              <Card>
                <p className="text-xs text-text-muted">Massa Muscular</p>
                <p className="text-xl font-semibold text-text-primary">
                  {records[0].muscle_mass || "—"} kg
                </p>
              </Card>
              <Card>
                <p className="text-xs text-text-muted">IMC</p>
                <p className="text-xl font-semibold text-text-primary">
                  {records[0].bmi || "—"}
                </p>
              </Card>
            </div>
          )}

          {/* History */}
          {records.map((rec) => (
            <Card key={rec.id} hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-text-primary">
                      {rec.weight}
                    </p>
                    <p className="text-xs text-text-muted">kg</p>
                  </div>
                  <div className="h-8 w-px bg-border-light" />
                  <div>
                    <p className="text-sm text-text-primary">
                      Gordura: {rec.body_fat_percentage || "—"}% | Músculo:{" "}
                      {rec.muscle_mass || "—"} kg
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(rec.measurement_date).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PrescricoesTab({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(`/api/patients/${patientId}/prescriptions`);
        if (res.ok) {
          const data = await res.json();
          setRecords(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [patientId]);

  const meds = records.filter((r) => r.type === "medication");
  const diets = records.filter((r) => r.type === "diet");
  const workouts = records.filter((r) => r.type === "workout");

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

      {loading ? (
        <SkeletonCard />
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <div className="text-center py-6">
                <Pill size={24} className="mx-auto text-blue-500 mb-2" />
                <p className="text-xs text-text-muted">Medicamentos</p>
                <p className="text-lg font-semibold text-text-primary">
                  {meds.length}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center py-6">
                <Utensils size={24} className="mx-auto text-green-500 mb-2" />
                <p className="text-xs text-text-muted">Dietas</p>
                <p className="text-lg font-semibold text-text-primary">
                  {diets.length}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center py-6">
                <Dumbbell
                  size={24}
                  className="mx-auto text-orange-500 mb-2"
                />
                <p className="text-xs text-text-muted">Treinos</p>
                <p className="text-lg font-semibold text-text-primary">
                  {workouts.length}
                </p>
              </div>
            </Card>
          </div>

          {records.length > 0 ? (
            <div className="space-y-3">
              {records.map((rec) => (
                <Card key={rec.id} hover>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {rec.type === "medication" && (
                        <Pill size={18} className="text-blue-500" />
                      )}
                      {rec.type === "diet" && (
                        <Utensils size={18} className="text-green-500" />
                      )}
                      {rec.type === "workout" && (
                        <Dumbbell size={18} className="text-orange-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {rec.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          {new Date(rec.start_date).toLocaleDateString("pt-BR")}
                          {rec.end_date &&
                            ` - ${new Date(rec.end_date).toLocaleDateString("pt-BR")}`}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-[var(--radius-full)] ${
                        rec.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-text-muted/10 text-text-muted"
                      }`}
                    >
                      {rec.status === "active" ? "Ativo" : rec.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-8">
                <Pill size={28} className="mx-auto text-text-muted mb-2" />
                <p className="text-text-muted text-sm">
                  Nenhuma prescrição registrada.
                </p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function HistoricoTab({ patientId }: { patientId: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        // Combine data from multiple sources for timeline
        const [anamRes, bioRes, prescRes] = await Promise.allSettled([
          fetch(`/api/patients/${patientId}/anamnesis`),
          fetch(`/api/patients/${patientId}/bioimpedance`),
          fetch(`/api/patients/${patientId}/prescriptions`),
        ]);

        const items: any[] = [];

        if (anamRes.status === "fulfilled" && anamRes.value.ok) {
          const data = await anamRes.value.json();
          (Array.isArray(data) ? data : []).forEach((r: any) => {
            items.push({
              id: r.id,
              type: "anamnesis",
              title: "Anamnese registrada",
              description: r.chief_complaint || "",
              date: r.created_at,
            });
          });
        }

        if (bioRes.status === "fulfilled" && bioRes.value.ok) {
          const data = await bioRes.value.json();
          (Array.isArray(data) ? data : []).forEach((r: any) => {
            items.push({
              id: r.id,
              type: "bioimpedance",
              title: `Bioimpedância - ${r.weight}kg`,
              description: `Gordura: ${r.body_fat_percentage || "—"}% | Músculo: ${r.muscle_mass || "—"}kg`,
              date: r.created_at,
            });
          });
        }

        if (prescRes.status === "fulfilled" && prescRes.value.ok) {
          const data = await prescRes.value.json();
          (Array.isArray(data) ? data : []).forEach((r: any) => {
            items.push({
              id: r.id,
              type: "prescription",
              title: r.title,
              description: `${r.type} - ${r.status}`,
              date: r.created_at,
            });
          });
        }

        items.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setHistory(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [patientId]);

  const typeIcons: Record<string, any> = {
    anamnesis: <FileText size={16} className="text-blue-500" />,
    bioimpedance: <Activity size={16} className="text-green-500" />,
    prescription: <Pill size={16} className="text-orange-500" />,
  };

  return (
    <div>
      <h3 className="font-medium text-text-primary mb-4">Histórico</h3>

      {loading ? (
        <SkeletonCard />
      ) : history.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Clock size={28} className="mx-auto text-text-muted mb-2" />
            <p className="text-text-muted text-sm">
              Nenhuma atividade registrada.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.id} hover>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{typeIcons[item.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-text-secondary mt-0.5 truncate">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-text-muted mt-1">
                    {new Date(item.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
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
        if (!res.ok) {
          let message = "Failed to fetch patient";
          try {
            const payload = await res.json();
            if (payload?.error) {
              message = payload.error;
            }
          } catch {
            // Ignore JSON parse errors and keep default message.
          }
          throw new Error(message);
        }

        const data = await res.json();
        setPatient(data);
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar dados do paciente"
        );
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
            {loading
              ? "..."
              : patient?.profiles?.full_name || "PACIENTE"}
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
              content: (
                <OverviewTab patientId={patientId} patient={patient} />
              ),
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
