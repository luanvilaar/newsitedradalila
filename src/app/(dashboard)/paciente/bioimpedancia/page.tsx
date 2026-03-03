"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Activity } from "lucide-react";
import dynamic from "next/dynamic";

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
  fat_percentage?: number;
  muscle_mass?: number;
  metabolic_rate?: number;
  bmi?: number;
}

export default function BioimpedanciaPage() {
  const [records, setRecords] = useState<BioimpedanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBioimpedance() {
      try {
        const res = await fetch("/api/patients/current/bioimpedance");
        if (!res.ok) throw new Error("Failed to fetch bioimpedance records");

        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching bioimpedance:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    fetchBioimpedance();
  }, []);

  const latestRecord = records.length > 0 ? records[0] : null;
  const chartData = records
    .slice()
    .reverse()
    .map((r) => ({
      date: new Date(r.measurement_date).toLocaleDateString("pt-BR", {
        month: "short",
        day: "numeric",
      }),
      weight: r.weight,
      fat: r.fat_percentage,
      muscle: r.muscle_mass,
      metabolic: r.metabolic_rate,
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
                {latestRecord?.fat_percentage
                  ? `${latestRecord.fat_percentage.toFixed(1)}`
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
                {latestRecord?.metabolic_rate
                  ? `${latestRecord.metabolic_rate.toFixed(0)}`
                  : "—"}
                <span className="text-sm text-text-muted ml-1">kcal</span>
              </p>
            </Card>
          </div>

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
        </>
      )}
    </div>
  );
}
