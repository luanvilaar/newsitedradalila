"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Activity, Download, Brain } from "lucide-react";
import dynamic from "next/dynamic";
import { BodySegmentIllustration, type SegmentTrendData } from "@/components/bioimpedance/BodySegmentIllustration";
import { AiPdfAnalysis } from "@/components/bioimpedance/AiPdfAnalysis";

// Dynamic import for Recharts to reduce bundle size
const LineChart = dynamic(() =>
  import("recharts").then(mod => mod.LineChart),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-text-muted">Carregando gráfico...</div> }
);
const Line = dynamic(() =>
  import("recharts").then(mod => mod.Line),
  { ssr: false }
);
const XAxis = dynamic(() =>
  import("recharts").then(mod => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(() =>
  import("recharts").then(mod => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(() =>
  import("recharts").then(mod => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(() =>
  import("recharts").then(mod => mod.Tooltip),
  { ssr: false }
);
const Legend = dynamic(() =>
  import("recharts").then(mod => mod.Legend),
  { ssr: false }
);
const ResponsiveContainer = dynamic(() =>
  import("recharts").then(mod => mod.ResponsiveContainer),
  { ssr: false }
);

interface BioimpedanceRecord {
  id: string;
  measurement_date: string;
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  basal_metabolic_rate?: number;
  bmi?: number;
}

interface BioimpedanceExam {
  id: string;
  created_at: string;
  parser_status: "pending" | "success" | "empty" | "failed";
  parsed_data?: {
    weight?: number;
    bmi?: number;
    body_fat_percentage?: number;
    ai_analysis?: Record<string, unknown>;
    ai_analyzed_at?: string;
  };
}

export default function BioimpedanciaPage() {
  const [records, setRecords] = useState<BioimpedanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingExams, setLoadingExams] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<BioimpedanceExam[]>([]);
  const [downloadingExamId, setDownloadingExamId] = useState<string | null>(null);
  const [segmentTrends, setSegmentTrends] = useState<SegmentTrendData[]>([]);
  const [selectedExamForAi, setSelectedExamForAi] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBioimpedance() {
      try {
        const [recordsRes, examsRes] = await Promise.all([
          fetch("/api/patients/current/bioimpedance"),
          fetch("/api/patients/current/bioimpedance/exams"),
        ]);

        if (!recordsRes.ok) {
          throw new Error("Failed to fetch bioimpedance records");
        }

        const recordsData = await recordsRes.json();
        setRecords(Array.isArray(recordsData) ? recordsData : []);

        if (Array.isArray(recordsData) && recordsData.length > 0) {
          calculateSegmentTrends(recordsData);
        }

        if (examsRes.ok) {
          const examsData = await examsRes.json();
          setExams(Array.isArray(examsData) ? examsData : []);
        }
      } catch (err) {
        console.error("Error fetching bioimpedance:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
        setLoadingExams(false);
      }
    }

    fetchBioimpedance();
  }, []);

  async function downloadExam(examId: string) {
    try {
      setDownloadingExamId(examId);
      const res = await fetch(`/api/bioimpedance/exams/${examId}/download`);

      if (!res.ok) {
        throw new Error("Falha ao gerar link de download");
      }

      const payload = await res.json();
      if (!payload?.url) {
        throw new Error("Link de download inválido");
      }

      window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Error downloading exam:", err);
      setError(err instanceof Error ? err.message : "Erro ao baixar exame");
    } finally {
      setDownloadingExamId(null);
    }
  }

  // Calculate trends between current and previous record
  function calculateSegmentTrends(records: BioimpedanceRecord[]) {
    if (records.length < 1) return;

    const current = records[0];
    const previous = records[1] || null;

    const calculateChange = (curr: number | undefined, prev: number | undefined) => {
      if (!curr || !prev || prev === 0) return 0;
      return ((curr - prev) / prev) * 100;
    };

    const muscleChange = previous
      ? calculateChange(current.muscle_mass, previous.muscle_mass)
      : 0;
    const fatChange = previous
      ? calculateChange(current.body_fat_percentage, previous.body_fat_percentage)
      : 0;

    // Determine cross-segment types when no previous record:
    // Based on fat % thresholds — gives color even on first measurement
    const fat = current.body_fat_percentage ?? 0;
    const muscle = current.muscle_mass ?? 0;
    const isFatHigh    = fat > 30;
    const isFatBorder  = fat > 24 && fat <= 30;
    const isMuscleGood = muscle > 25;

    const getTypeNoTrend = (role: "arm" | "leg" | "torso") => {
      if (isFatHigh)   return "concern"  as const;
      if (isFatBorder) return "fat"      as const;
      if (isMuscleGood) return "muscle"  as const;
      // torso is the main indicator; arms/legs get water if hydration looks ok
      if (role === "torso" && muscle > 18) return "water" as const;
      return "stable" as const;
    };

    const getType = (role: "arm" | "leg" | "torso") => {
      if (!previous) return getTypeNoTrend(role);
      // With trend data
      if (role === "torso") {
        if      (muscleChange > 3)  return "muscle"  as const;
        if      (muscleChange < -3) return "concern" as const;
        if      (fatChange   > 5)   return "fat"     as const;
        return "stable" as const;
      }
      if (muscleChange > 5)  return "muscle"  as const;
      if (muscleChange < -5) return "concern" as const;
      return "stable" as const;
    };

    // Realistic segment proportions:
    // torso ~42%, each arm ~4%, each leg ~23% of total muscle mass
    const trends: SegmentTrendData[] = [
      {
        segment: "armLeft",
        currentValue: muscle * 0.04,
        previousValue: (previous?.muscle_mass ?? muscle) * 0.04,
        percentChange: muscleChange,
        type: getType("arm"),
        hasSignificantChange: Math.abs(muscleChange) > 5,
      },
      {
        segment: "armRight",
        currentValue: muscle * 0.04,
        previousValue: (previous?.muscle_mass ?? muscle) * 0.04,
        percentChange: muscleChange,
        type: getType("arm"),
        hasSignificantChange: Math.abs(muscleChange) > 5,
      },
      {
        segment: "legLeft",
        currentValue: muscle * 0.23,
        previousValue: (previous?.muscle_mass ?? muscle) * 0.23,
        percentChange: muscleChange,
        type: getType("leg"),
        hasSignificantChange: Math.abs(muscleChange) > 5,
      },
      {
        segment: "legRight",
        currentValue: muscle * 0.23,
        previousValue: (previous?.muscle_mass ?? muscle) * 0.23,
        percentChange: muscleChange,
        type: getType("leg"),
        hasSignificantChange: Math.abs(muscleChange) > 5,
      },
      {
        segment: "torso",
        currentValue: muscle * 0.42,
        previousValue: (previous?.muscle_mass ?? muscle) * 0.42,
        percentChange: muscleChange,
        type: getType("torso"),
        hasSignificantChange: Math.abs(muscleChange) > 3,
      },
    ];

    setSegmentTrends(trends);
  }

  const latestRecord = records.length > 0 ? records[0] : null;
  const previousRecord = records.length > 1 ? records[1] : null;
  const chartData = records
    .slice()
    .reverse()
    .map((r) => ({
      date: new Date(r.measurement_date).toLocaleDateString("pt-BR", {
        month: "short",
        day: "numeric",
      }),
      weight: r.weight,
      fat: r.body_fat_percentage,
      muscle: r.muscle_mass,
      metabolic: r.basal_metabolic_rate,
    }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
          BIOIMPEDÂNCIA
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Seus resultados de composição corporal.
        </p>
      </div>

      {loading ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonCard />
        </>
      ) : error ? (
        <Card className="border border-error/20 bg-error/5">
          <p className="text-error text-sm">{error}</p>
        </Card>
      ) : (
        <>
          {/* Metrics Summary */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card padding="sm">
              <p className="text-xs text-text-muted">Peso</p>
              <p className="text-2xl font-semibold text-text-primary mt-1">
                {latestRecord?.weight ? `${latestRecord.weight.toFixed(1)}` : "—"}
                <span className="text-sm text-text-muted ml-1">kg</span>
              </p>
            </Card>
            <Card padding="sm">
              <p className="text-xs text-text-muted">% Gordura</p>
              <p className="text-2xl font-semibold text-text-primary mt-1">
                {latestRecord?.body_fat_percentage
                  ? `${latestRecord.body_fat_percentage.toFixed(1)}`
                  : "—"}
                <span className="text-sm text-text-muted ml-1">%</span>
              </p>
            </Card>
            <Card padding="sm">
              <p className="text-xs text-text-muted">Massa Muscular</p>
              <p className="text-2xl font-semibold text-text-primary mt-1">
                {latestRecord?.muscle_mass
                  ? `${latestRecord.muscle_mass.toFixed(1)}`
                  : "—"}
                <span className="text-sm text-text-muted ml-1">kg</span>
              </p>
            </Card>
            <Card padding="sm">
              <p className="text-xs text-text-muted">Taxa Metabólica</p>
              <p className="text-2xl font-semibold text-text-primary mt-1">
                {latestRecord?.basal_metabolic_rate
                  ? `${latestRecord.basal_metabolic_rate.toFixed(0)}`
                  : "—"}
                <span className="text-sm text-text-muted ml-1">kcal</span>
              </p>
            </Card>
          </div>

          <Card className="mb-6">
            <h2 className="font-medium text-text-primary mb-4">
              Exames de Bioimpedância (PDF)
            </h2>

            {loadingExams ? (
              <p className="text-sm text-text-muted">Carregando exames...</p>
            ) : exams.length === 0 ? (
              <p className="text-sm text-text-muted">
                Nenhum PDF de bioimpedância disponível.
              </p>
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <div key={exam.id}>
                    <div
                      className={`flex items-center justify-between gap-4 border rounded-lg p-3 transition-colors ${
                        selectedExamForAi === exam.id
                          ? "border-violet-300 bg-violet-50/30"
                          : "border-border-light"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {new Date(exam.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          Peso: {exam.parsed_data?.weight ?? "—"} kg · IMC: {exam.parsed_data?.bmi ?? "—"} · Gordura: {exam.parsed_data?.body_fat_percentage ?? "—"}%
                          {exam.parsed_data?.ai_analyzed_at && (
                            <span className="ml-2 inline-flex items-center gap-1 text-violet-600">
                              <Brain size={10} /> IA analisado
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50"
                          onClick={() =>
                            setSelectedExamForAi(
                              selectedExamForAi === exam.id ? null : exam.id
                            )
                          }
                        >
                          <Brain size={14} />
                          {selectedExamForAi === exam.id ? "Fechar IA" : "Análise IA"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => downloadExam(exam.id)}
                          disabled={downloadingExamId === exam.id}
                        >
                          <Download size={14} />
                          {downloadingExamId === exam.id ? "Gerando..." : "PDF"}
                        </Button>
                      </div>
                    </div>

                    {/* AI Analysis Panel */}
                    {selectedExamForAi === exam.id && (
                      <div className="mt-3 ml-2">
                        <AiPdfAnalysis
                          examId={exam.id}
                          initialAnalysis={
                            exam.parsed_data?.ai_analysis
                              ? (exam.parsed_data.ai_analysis as unknown as Parameters<typeof AiPdfAnalysis>[0]["initialAnalysis"])
                              : null
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Chart area */}
          {records.length === 0 ? (
            <Card>
              <h2 className="font-medium text-text-primary mb-4">
                Evolução Corporal
              </h2>
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
                  <Activity size={28} className="text-text-muted" />
                </div>
                <p className="text-text-secondary text-sm font-medium">
                  Nenhum registro de bioimpedância
                </p>
                <p className="text-text-muted text-xs mt-2 max-w-sm mx-auto">
                  Gráficos de evolução de peso, gordura corporal e massa muscular aparecerão aqui após seus registros.
                </p>
              </div>
            </Card>
          ) : (
            <Card>
              <h2 className="font-medium text-text-primary mb-4">
                Evolução Corporal
              </h2>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" style={{ fontSize: "12px" }} />
                  <YAxis stroke="var(--color-text-muted)" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "var(--color-text-primary)" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Line type="monotone" dataKey="weight" stroke="var(--color-accent-gold)" name="Peso (kg)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="fat" stroke="#ef4444" name="Gordura (%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="muscle" stroke="var(--color-medical-green)" name="Massa Muscular (kg)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Análise Segmentar - New Avatar */}
          {latestRecord && segmentTrends.length > 0 && (
            <div className="mt-8">
              <Card>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-text-primary">
                    Análise Corporal Segmentar
                  </h2>
                  <p className="text-sm text-text-muted mt-2">
                    Visualização detalhada da composição corporal por região
                    {previousRecord && (
                      <span>
                        {" "}
                        · Comparado com{" "}
                        {new Date(previousRecord.measurement_date).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Massa Magra */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-4">
                      Massa Magra
                    </h3>
                    <div className="flex justify-center">
                      <BodySegmentIllustration
                        segments={segmentTrends}
                        gender="neutral"
                        mode="leanMass"
                        size="md"
                        className="max-w-sm"
                      />
                    </div>
                    <div className="mt-4 text-center text-sm">
                      <p className="text-text-muted">
                        Total: <span className="font-semibold text-text-primary">{latestRecord.muscle_mass?.toFixed(1)} kg</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
