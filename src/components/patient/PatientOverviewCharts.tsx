"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { SegmentalBodyAnalysis } from "@/components/bioimpedance/SegmentalBodyAnalysis";

// ── Types ─────────────────────────────────────────────────────────────────────
interface BioRecord {
  id: string;
  weight: number;
  bmi: number | null;
  body_fat_percentage: number | null;
  muscle_mass: number | null;
  water_percentage: number | null;
  visceral_fat: number | null;
  basal_metabolic_rate: number | null;
  measurement_date: string;
}

interface Prescription {
  id: string;
  type: string;
  status: string;
  title: string;
}

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
  unit?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<TooltipEntry>;
  label?: string | number;
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const GOLD = "#B89C64";
const GOLD_LIGHT = "#D4B88A";
const GOLD_PALE = "#EDE6DF";
const MUTED = "#8A8073";
const GREEN = "#7BA68C";
const BLUE = "#6B8CAE";
const ROSE = "#C47E7E";

const PIE_COLORS = [GOLD, GREEN, BLUE, "#C9A96E", ROSE];

const PRESCRIPTION_LABELS: Record<string, string> = {
  medication: "Medicamento",
  diet: "Dieta",
  workout: "Treino",
  supplement: "Suplemento",
};

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#B89C64]/30 rounded-xl shadow-lg px-4 py-3 text-xs">
      {label != null && (
        <p className="font-semibold text-[#1C1C1C] mb-2">{label}</p>
      )}
      {payload.map((entry: TooltipEntry, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: entry.color ?? GOLD }}
          />
          <span className="text-[#8A8073]">{entry.name}:</span>
          <span className="font-semibold text-[#1C1C1C]">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      className="rounded-2xl bg-[#F5F0EB] animate-pulse"
      style={{ height }}
    />
  );
}

// ── Animation variants ────────────────────────────────────────────────────────
const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

// ── Chart card ────────────────────────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  index,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={`bg-white rounded-2xl border border-[#B89C64]/20 shadow-[0_4px_24px_rgba(184,156,100,0.08)] p-5 ${className}`}
    >
      <div className="mb-4">
        <p className="font-heading text-sm tracking-wide text-[#1C1C1C]">
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-[#8A8073] mt-0.5">{subtitle}</p>
        )}
        <div className="mt-2 h-px w-10 bg-gradient-to-r from-[#B89C64] to-transparent rounded-full" />
      </div>
      {children}
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-xs text-[#8A8073]">
      {label}
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────────────────────
function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-4 mt-8">
      <div className="h-px flex-1 bg-gradient-to-r from-[#B89C64]/40 to-transparent" />
      <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#8A8073]">
        {title}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-[#B89C64]/40 to-transparent" />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function PatientOverviewCharts({ patientId }: { patientId: string }) {
  const [bioRecords, setBioRecords] = useState<BioRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bioRes, prescRes] = await Promise.allSettled([
          fetch(`/api/patients/${patientId}/bioimpedance`),
          fetch(`/api/patients/${patientId}/prescriptions`),
        ]);

        if (bioRes.status === "fulfilled" && bioRes.value.ok) {
          const data = await bioRes.value.json();
          setBioRecords(
            (Array.isArray(data) ? data : []).sort(
              (a: BioRecord, b: BioRecord) =>
                new Date(a.measurement_date).getTime() -
                new Date(b.measurement_date).getTime()
            )
          );
        }

        if (prescRes.status === "fulfilled" && prescRes.value.ok) {
          const data = await prescRes.value.json();
          setPrescriptions(Array.isArray(data) ? data : []);
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientId]);

  // No data at all → don't render
  if (!loading && bioRecords.length === 0 && prescriptions.length === 0) {
    return null;
  }

  // ── Derived data ─────────────────────────────────────────────────────
  const hasBio = bioRecords.length > 0;

  // Body composition timeline (weight + muscle + fat)
  const compositionData = bioRecords.map((r) => ({
    date: new Date(r.measurement_date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
    peso: r.weight,
    gordura: r.body_fat_percentage,
    musculo: r.muscle_mass,
  }));

  // BMI + metabolic timeline 
  const bmiData = bioRecords
    .filter((r) => r.bmi != null)
    .map((r) => ({
      date: new Date(r.measurement_date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      }),
      imc: r.bmi,
      agua: r.water_percentage,
    }));

  // Prescriptions by type (donut)
  const prescByType: Record<string, number> = {};
  for (const p of prescriptions) {
    prescByType[p.type] = (prescByType[p.type] ?? 0) + 1;
  }
  const prescDonutData = Object.entries(PRESCRIPTION_LABELS)
    .map(([key, label]) => ({ name: label, value: prescByType[key] ?? 0 }))
    .filter((e) => e.value > 0);

  // Active vs inactive prescriptions
  const activePresc = prescriptions.filter((p) => p.status === "active").length;

  // Latest bio deltas
  const latest = bioRecords[bioRecords.length - 1];
  const prev = bioRecords.length >= 2 ? bioRecords[bioRecords.length - 2] : null;

  function delta(cur: number | null, pre: number | null, unit: string) {
    if (cur == null || pre == null) return null;
    const diff = +(cur - pre).toFixed(1);
    const sign = diff >= 0 ? "+" : "";
    return { diff, label: `${sign}${diff}${unit}` };
  }

  return (
    <div>
      <SectionDivider title="Evolução do Paciente" />

      {loading ? (
        <div className="grid lg:grid-cols-2 gap-4">
          <ChartSkeleton height={260} />
          <ChartSkeleton height={260} />
        </div>
      ) : (
        <>
          {/* KPI strip */}
          {hasBio && latest && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                {
                  label: "Peso",
                  value: `${latest.weight} kg`,
                  d: delta(latest.weight, prev?.weight ?? null, " kg"),
                },
                {
                  label: "Gordura",
                  value:
                    latest.body_fat_percentage != null
                      ? `${latest.body_fat_percentage}%`
                      : "—",
                  d: delta(
                    latest.body_fat_percentage,
                    prev?.body_fat_percentage ?? null,
                    "%"
                  ),
                },
                {
                  label: "Massa Muscular",
                  value:
                    latest.muscle_mass != null
                      ? `${latest.muscle_mass} kg`
                      : "—",
                  d: delta(latest.muscle_mass, prev?.muscle_mass ?? null, " kg"),
                },
                {
                  label: "IMC",
                  value: latest.bmi != null ? `${latest.bmi}` : "—",
                  d: delta(latest.bmi, prev?.bmi ?? null, ""),
                },
              ].map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  custom={i}
                  variants={cardVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  className="bg-white rounded-2xl border border-[#B89C64]/20 shadow-[0_4px_24px_rgba(184,156,100,0.06)] px-4 py-3"
                >
                  <p className="text-[10px] text-[#8A8073] uppercase tracking-widest mb-0.5">
                    {kpi.label}
                  </p>
                  <p className="text-xl font-semibold text-[#1C1C1C]">
                    {kpi.value}
                  </p>
                  {kpi.d && (
                    <span
                      className={`text-[11px] font-medium mt-0.5 inline-block ${
                        kpi.label === "Gordura"
                          ? kpi.d.diff <= 0
                            ? "text-[#7BA68C]"
                            : "text-rose-400"
                          : kpi.d.diff >= 0
                            ? "text-[#7BA68C]"
                            : "text-rose-400"
                      }`}
                    >
                      {kpi.d.label}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Charts row 1 */}
          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            {/* Composição corporal */}
            {hasBio && compositionData.length >= 2 ? (
              <ChartCard
                index={0}
                title="Composição Corporal"
                subtitle="Peso, gordura e massa muscular ao longo do tempo"
              >
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={compositionData}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GOLD_PALE}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={7}
                      wrapperStyle={{
                        fontSize: 10,
                        color: MUTED,
                        paddingTop: 8,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="peso"
                      name="Peso (kg)"
                      stroke={GOLD}
                      strokeWidth={2.5}
                      dot={{ fill: GOLD, r: 3, strokeWidth: 0 }}
                      activeDot={{
                        r: 5,
                        fill: GOLD,
                        stroke: "white",
                        strokeWidth: 2,
                      }}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                    <Line
                      type="monotone"
                      dataKey="gordura"
                      name="Gordura (%)"
                      stroke={ROSE}
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      dot={{ fill: ROSE, r: 2.5, strokeWidth: 0 }}
                      animationDuration={1400}
                      animationEasing="ease-out"
                    />
                    <Line
                      type="monotone"
                      dataKey="musculo"
                      name="Músculo (kg)"
                      stroke={GREEN}
                      strokeWidth={2}
                      dot={{ fill: GREEN, r: 2.5, strokeWidth: 0 }}
                      animationDuration={1600}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            ) : hasBio ? (
              <ChartCard index={0} title="Composição Corporal">
                <EmptyState label="Necessário ao menos 2 registros para gerar gráfico" />
              </ChartCard>
            ) : null}

            {/* IMC + Água */}
            {bmiData.length >= 2 ? (
              <ChartCard
                index={1}
                title="IMC e Hidratação"
                subtitle="Evolução do IMC e percentual de água"
              >
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart
                    data={bmiData}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="gradIMC"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={GOLD}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor={GOLD}
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="gradAgua"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={BLUE}
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="100%"
                          stopColor={BLUE}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GOLD_PALE}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={7}
                      wrapperStyle={{
                        fontSize: 10,
                        color: MUTED,
                        paddingTop: 8,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="imc"
                      name="IMC"
                      stroke={GOLD}
                      strokeWidth={2}
                      fill="url(#gradIMC)"
                      dot={{ fill: GOLD, r: 3, strokeWidth: 0 }}
                      activeDot={{
                        r: 5,
                        fill: GOLD,
                        stroke: "white",
                        strokeWidth: 2,
                      }}
                      animationDuration={1200}
                    />
                    <Area
                      type="monotone"
                      dataKey="agua"
                      name="Água (%)"
                      stroke={BLUE}
                      strokeWidth={2}
                      fill="url(#gradAgua)"
                      dot={{ fill: BLUE, r: 2.5, strokeWidth: 0 }}
                      animationDuration={1400}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            ) : hasBio ? (
              <ChartCard index={1} title="IMC e Hidratação">
                <EmptyState label="Necessário ao menos 2 registros para gerar gráfico" />
              </ChartCard>
            ) : null}
          </div>

          {/* Charts row 2 */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Prescrições por tipo (donut) */}
            {prescDonutData.length > 0 && (
              <ChartCard
                index={2}
                title="Prescrições por Tipo"
                subtitle={`${prescriptions.length} total · ${activePresc} ativas`}
              >
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <defs>
                        {prescDonutData.map((_, i) => (
                          <radialGradient
                            key={i}
                            id={`prg${i}`}
                            cx="50%"
                            cy="50%"
                            r="50%"
                          >
                            <stop
                              offset="0%"
                              stopColor={PIE_COLORS[i % PIE_COLORS.length]}
                              stopOpacity={1}
                            />
                            <stop
                              offset="100%"
                              stopColor={PIE_COLORS[i % PIE_COLORS.length]}
                              stopOpacity={0.7}
                            />
                          </radialGradient>
                        ))}
                      </defs>
                      <Pie
                        data={prescDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={66}
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={200}
                        animationDuration={1000}
                        strokeWidth={0}
                      >
                        {prescDonutData.map((_, i) => (
                          <Cell key={i} fill={`url(#prg${i})`} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }: ChartTooltipProps) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0];
                          return (
                            <div className="bg-white border border-[#B89C64]/30 rounded-xl shadow-lg px-3 py-2 text-xs">
                              <p className="font-semibold text-[#1C1C1C]">
                                {d.name}
                              </p>
                              <p className="text-[#8A8073]">
                                {d.value} prescrições
                              </p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 w-full mt-1">
                    {prescDonutData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            background: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-[10px] text-[#8A8073] truncate">
                          {item.name}
                        </span>
                        <span className="ml-auto text-[10px] font-semibold text-[#1C1C1C]">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            )}

            {/* Peso — barras */}
            {hasBio && compositionData.length >= 2 && (
              <ChartCard
                index={3}
                title="Evolução de Peso"
                subtitle="Barras por medição"
              >
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={compositionData}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    barCategoryGap="25%"
                  >
                    <defs>
                      <linearGradient
                        id="barWeight"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={GOLD}
                          stopOpacity={1}
                        />
                        <stop
                          offset="100%"
                          stopColor={GOLD_LIGHT}
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GOLD_PALE}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={["dataMin - 2", "dataMax + 2"]}
                      tick={{ fontSize: 10, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: GOLD_PALE, radius: 6 }}
                    />
                    <Bar
                      dataKey="peso"
                      name="Peso (kg)"
                      fill="url(#barWeight)"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={48}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>

          {/* Análise Segmentar Premium */}
          {hasBio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <div className="bg-white rounded-3xl border border-[#B89C64]/20 shadow-[0_4px_24px_rgba(184,156,100,0.06)] p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#1C1C1C]">
                    Análise Corporal Segmentar
                  </h3>
                  <p className="text-xs text-[#8A8073] mt-1">
                    Visualização detalhada da composição corporal por região
                  </p>
                </div>
                <SegmentalBodyAnalysis />
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
