"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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

// ── Types ─────────────────────────────────────────────────────────────────────
interface MonthPoint {
  month: string;
  value: number;
}

interface ServiceMonthPoint {
  month: string;
  consultas: number;
  procedimentos: number;
}

interface TypePoint {
  name: string;
  value: number;
}

interface KPIs {
  totalPatients: number;
  newPatientsThisMonth: number;
  newPatientsPrevMonth: number;
  completionRate: number | null;
  cancellationRate: number | null;
  totalServices6m: number;
}

interface ChartsData {
  patientsByMonth: MonthPoint[];
  servicesByMonth: ServiceMonthPoint[];
  servicesByType: TypePoint[];
  prescriptionsByType: TypePoint[];
  kpis: KPIs;
}

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
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

const PIE_COLORS = [GOLD, GREEN, "#C9A96E", "#A89070", "#90A0B4"];

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#B89C64]/30 rounded-xl shadow-lg px-4 py-3 text-xs">
      {label != null && <p className="font-semibold text-[#1C1C1C] mb-2">{label}</p>}
      {payload.map((entry: TooltipEntry, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: entry.color ?? GOLD }}
          />
          <span className="text-[#8A8073]">{entry.name}:</span>
          <span className="font-semibold text-[#1C1C1C]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div
      className="rounded-2xl bg-[#F5F0EB] animate-pulse"
      style={{ height }}
    />
  );
}

// ── Animation variants ────────────────────────────────────────────────────────
const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

// ── Section divider ───────────────────────────────────────────────────────────
function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="h-px flex-1 bg-gradient-to-r from-[#B89C64]/40 to-transparent" />
      <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#8A8073]">
        {title}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-[#B89C64]/40 to-transparent" />
    </div>
  );
}

// ── Chart card wrapper ────────────────────────────────────────────────────────
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
      className={`bg-white rounded-2xl border border-[#B89C64]/20 shadow-[0_4px_24px_rgba(184,156,100,0.08)] p-6 ${className}`}
    >
      <div className="mb-5">
        <p className="font-heading text-base tracking-wide text-[#1C1C1C]">{title}</p>
        {subtitle && (
          <p className="text-xs text-[#8A8073] mt-0.5">{subtitle}</p>
        )}
        <div className="mt-3 h-px w-12 bg-gradient-to-r from-[#B89C64] to-transparent rounded-full" />
      </div>
      {children}
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-40 text-xs text-[#8A8073]">
      {label}
    </div>
  );
}

// ── Delta badge ───────────────────────────────────────────────────────────────
function Delta({ current, prev }: { current: number; prev: number }) {
  if (prev === 0 && current === 0) return null;
  const diff = current - prev;
  const positive = diff >= 0;
  return (
    <span
      className={`text-xs font-medium mt-1 inline-block ${
        positive ? "text-[#7BA68C]" : "text-rose-400"
      }`}
    >
      {positive ? "+" : ""}
      {diff} vs mês anterior
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function DashboardCharts() {
  const [data, setData] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/charts");
        if (!res.ok) throw new Error("Falha ao carregar dados");
        const json: ChartsData = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (error) return null;

  return (
    <div className="mt-10 space-y-10">
      <SectionDivider title="Análise e Desempenho" />

      {/* Row 1: Area chart + Donut */}
      <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
        {/* Novos pacientes por mês */}
        <ChartCard
          index={0}
          title="Novos Pacientes — Últimos 6 Meses"
          subtitle="Cadastros realizados por mês"
        >
          {loading ? (
            <ChartSkeleton height={240} />
          ) : !data?.patientsByMonth.some((p) => p.value > 0) ? (
            <EmptyState label="Nenhum paciente cadastrado nos últimos 6 meses" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={data.patientsByMonth}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradPacientes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GOLD_PALE} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: MUTED }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: MUTED }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Novos pacientes"
                  stroke={GOLD}
                  strokeWidth={2.5}
                  fill="url(#gradPacientes)"
                  dot={{ fill: GOLD, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: GOLD, stroke: "white", strokeWidth: 2 }}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Serviços por tipo */}
        <ChartCard
          index={1}
          title="Atendimentos por Tipo"
          subtitle="Distribuição nos últimos 6 meses"
        >
          {loading ? (
            <ChartSkeleton height={240} />
          ) : !data?.servicesByType.length ? (
            <EmptyState label="Nenhum atendimento registrado" />
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <defs>
                    {data.servicesByType.map((_, i) => (
                      <radialGradient key={i} id={`srg${i}`} cx="50%" cy="50%" r="50%">
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
                    data={data.servicesByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1000}
                    strokeWidth={0}
                  >
                    {data.servicesByType.map((_, i) => (
                      <Cell key={i} fill={`url(#srg${i})`} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }: ChartTooltipProps) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0];
                      return (
                        <div className="bg-white border border-[#B89C64]/30 rounded-xl shadow-lg px-3 py-2 text-xs">
                          <p className="font-semibold text-[#1C1C1C]">{d.name}</p>
                          <p className="text-[#8A8073]">{d.value} atendimentos</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full mt-2">
                {data.servicesByType.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-[11px] text-[#8A8073] truncate">{item.name}</span>
                    <span className="ml-auto text-[11px] font-semibold text-[#1C1C1C]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Row 2: Bar chart */}
      <ChartCard
        index={2}
        title="Consultas × Procedimentos por Mês"
        subtitle="Volume total de serviços nos últimos 6 meses"
      >
        {loading ? (
          <ChartSkeleton height={200} />
        ) : !data?.servicesByMonth.some(
            (s) => s.consultas > 0 || s.procedimentos > 0
          ) ? (
          <EmptyState label="Nenhum serviço registrado nos últimos 6 meses" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={data.servicesByMonth}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              barCategoryGap="30%"
              barGap={4}
            >
              <defs>
                <linearGradient id="barGradConsulta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={1} />
                  <stop offset="100%" stopColor={GOLD_LIGHT} stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="barGradProc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={GREEN} stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GOLD_PALE} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: MUTED }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: MUTED }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: GOLD_PALE, radius: 8 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: MUTED, paddingTop: 12 }}
              />
              <Bar
                dataKey="consultas"
                name="Consultas"
                fill="url(#barGradConsulta)"
                radius={[5, 5, 0, 0]}
                maxBarSize={40}
                animationDuration={1000}
                animationEasing="ease-out"
              />
              <Bar
                dataKey="procedimentos"
                name="Procedimentos"
                fill="url(#barGradProc)"
                radius={[5, 5, 0, 0]}
                maxBarSize={40}
                animationDuration={1100}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* KPI strip */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#F5F0EB] animate-pulse" />
          ))}
        </div>
      ) : data?.kpis ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            custom={3}
            variants={cardVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="bg-white rounded-2xl border border-[#B89C64]/20 shadow-[0_4px_24px_rgba(184,156,100,0.06)] px-5 py-4"
          >
            <p className="text-[11px] text-[#8A8073] uppercase tracking-widest mb-1">
              Total Pacientes
            </p>
            <p className="text-2xl font-semibold text-[#1C1C1C]">
              {data.kpis.totalPatients}
            </p>
            <Delta
              current={data.kpis.newPatientsThisMonth}
              prev={data.kpis.newPatientsPrevMonth}
            />
          </motion.div>

          <motion.div
            custom={4}
            variants={cardVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="bg-white rounded-2xl border border-[#B89C64]/20 shadow-[0_4px_24px_rgba(184,156,100,0.06)] px-5 py-4"
          >
            <p className="text-[11px] text-[#8A8073] uppercase tracking-widest mb-1">
              Novos Este Mês
            </p>
            <p className="text-2xl font-semibold text-[#1C1C1C]">
              {data.kpis.newPatientsThisMonth}
            </p>
            <span className="text-xs text-[#8A8073] mt-1 inline-block">
              pacientes cadastrados
            </span>
          </motion.div>

          <motion.div
            custom={5}
            variants={cardVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="bg-white rounded-2xl border border-[#B89C64]/20 shadow-[0_4px_24px_rgba(184,156,100,0.06)] px-5 py-4"
          >
            <p className="text-[11px] text-[#8A8073] uppercase tracking-widest mb-1">
              Conclusão
            </p>
            <p className="text-2xl font-semibold text-[#1C1C1C]">
              {data.kpis.completionRate != null ? `${data.kpis.completionRate}%` : "—"}
            </p>
            <span className="text-xs text-[#8A8073] mt-1 inline-block">
              serviços concluídos
            </span>
          </motion.div>

          <motion.div
            custom={6}
            variants={cardVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="bg-white rounded-2xl border border-[#B89C64]/20 shadow-[0_4px_24px_rgba(184,156,100,0.06)] px-5 py-4"
          >
            <p className="text-[11px] text-[#8A8073] uppercase tracking-widest mb-1">
              Cancelamentos
            </p>
            <p className="text-2xl font-semibold text-[#1C1C1C]">
              {data.kpis.cancellationRate != null
                ? `${data.kpis.cancellationRate}%`
                : "—"}
            </p>
            <span className="text-xs text-[#8A8073] mt-1 inline-block">
              taxa últimos 6 meses
            </span>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
