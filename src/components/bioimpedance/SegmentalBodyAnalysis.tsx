"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface SegmentData {
  value: number; // kg
  percentage: number; // %
  status: "Normal" | "Acima" | "Abaixo";
}

interface SegmentalData {
  leftArm: SegmentData;
  rightArm: SegmentData;
  trunk: SegmentData;
  leftLeg: SegmentData;
  rightLeg: SegmentData;
}

interface SegmentalBodyAnalysisProps {
  leanMass?: SegmentalData;
  fatMass?: SegmentalData;
  className?: string;
}

// Dados padrão baseados na imagem
const defaultLeanMass: SegmentalData = {
  leftArm: { value: 2.10, percentage: 108.7, status: "Normal" },
  rightArm: { value: 2.10, percentage: 108.7, status: "Normal" },
  trunk: { value: 19.2, percentage: 90.4, status: "Normal" },
  leftLeg: { value: 7.21, percentage: 98.8, status: "Normal" },
  rightLeg: { value: 7.11, percentage: 98.0, status: "Normal" },
};

const defaultFatMass: SegmentalData = {
  leftArm: { value: 1.3, percentage: 127.4, status: "Normal" },
  rightArm: { value: 1.3, percentage: 127.3, status: "Normal" },
  trunk: { value: 9.1, percentage: 165.8, status: "Acima" },
  leftLeg: { value: 3.0, percentage: 120.1, status: "Normal" },
  rightLeg: { value: 3.0, percentage: 120.2, status: "Normal" },
};

export function SegmentalBodyAnalysis({
  leanMass = defaultLeanMass,
  fatMass = defaultFatMass,
  className = "",
}: SegmentalBodyAnalysisProps) {
  const [activeView, setActiveView] = useState<"lean" | "fat">("lean");

  const currentData = activeView === "lean" ? leanMass : fatMass;
  const title =
    activeView === "lean"
      ? "Análise da Massa Magra Segmentar"
      : "Análise da Gordura Segmentar";

  return (
    <div className={`relative ${className}`}>
      {/* Header com Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveView("lean")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeView === "lean"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Massa Magra
          </button>
          <button
            onClick={() => setActiveView("fat")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeView === "fat"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Gordura
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Lado Esquerdo */}
        <BodySegmentCard
          side="left"
          data={{
            arm: currentData.leftArm,
            leg: currentData.leftLeg,
          }}
          activeView={activeView}
        />

        {/* Lado Direito */}
        <BodySegmentCard
          side="right"
          data={{
            arm: currentData.rightArm,
            leg: currentData.rightLeg,
          }}
          activeView={activeView}
        />
      </div>

      {/* Tronco - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <TrunkSegmentCard data={currentData.trunk} activeView={activeView} />
      </motion.div>

      {/* Nota sobre estimativa */}
      {activeView === "fat" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-xs text-gray-500"
        >
          * A gordura segmentar é estimada
        </motion.p>
      )}
    </div>
  );
}

interface BodySegmentCardProps {
  side: "left" | "right";
  data: {
    arm: SegmentData;
    leg: SegmentData;
  };
  activeView: "lean" | "fat";
}

function BodySegmentCard({ side, data, activeView }: BodySegmentCardProps) {
  const isLeft = side === "left";
  const sideLabel = isLeft ? "Esquerdo" : "Direito";
  const color = activeView === "lean" ? "blue" : "orange";

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="relative rounded-xl bg-gradient-to-br from-gray-50 to-white p-6 shadow-lg"
    >
      {/* Human Silhouette */}
      <div className="relative mx-auto mb-6 h-64 w-32">
        <HumanSilhouette side={side} activeView={activeView} segments={data} />
      </div>

      {/* Arm Data */}
      <SegmentDataDisplay
        label="Braço"
        segment={data.arm}
        color={color}
        delay={0.2}
      />

      {/* Leg Data */}
      <SegmentDataDisplay
        label="Perna"
        segment={data.leg}
        color={color}
        delay={0.3}
      />

      {/* Side Label */}
      <div className="mt-4 text-center">
        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {sideLabel}
        </span>
      </div>
    </motion.div>
  );
}

interface TrunkSegmentCardProps {
  data: SegmentData;
  activeView: "lean" | "fat";
}

function TrunkSegmentCard({ data, activeView }: TrunkSegmentCardProps) {
  const color = activeView === "lean" ? "blue" : "orange";

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${
              color === "blue"
                ? "from-blue-100 to-blue-200"
                : "from-orange-100 to-orange-200"
            }`}
          >
            <svg
              className={`h-8 w-8 ${color === "blue" ? "text-blue-600" : "text-orange-600"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Tronco</h4>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
              className="text-2xl font-bold text-gray-900"
            >
              {data.value.toFixed(1)}kg
            </motion.p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="text-right"
          >
            <div className="text-2xl font-bold text-gray-900">
              {data.percentage.toFixed(1)}%
            </div>
            <StatusBadge status={data.status} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface SegmentDataDisplayProps {
  label: string;
  segment: SegmentData;
  color: "blue" | "orange";
  delay: number;
}

function SegmentDataDisplay({
  label,
  segment,
  color,
  delay,
}: SegmentDataDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-4 rounded-lg bg-white p-4 shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <StatusBadge status={segment.status} />
      </div>

      <div className="flex items-end justify-between">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: delay + 0.1 }}
        >
          <div className="text-2xl font-bold text-gray-900">
            {segment.value.toFixed(2)}kg
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="text-right"
        >
          <div
            className={`text-xl font-semibold ${
              color === "blue" ? "text-blue-600" : "text-orange-600"
            }`}
          >
            {segment.percentage.toFixed(1)}%
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.5 }}
        className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"
        style={{ originX: 0 }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(segment.percentage, 200)}%` }}
          transition={{ delay: delay + 0.4, duration: 0.6 }}
          className={`h-full rounded-full ${
            segment.status === "Normal"
              ? color === "blue"
                ? "bg-gradient-to-r from-blue-400 to-blue-600"
                : "bg-gradient-to-r from-orange-400 to-orange-600"
              : "bg-gradient-to-r from-red-400 to-red-600"
          }`}
        />
      </motion.div>
    </motion.div>
  );
}

interface StatusBadgeProps {
  status: "Normal" | "Acima" | "Abaixo";
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Normal: "bg-green-100 text-green-700 border-green-200",
    Acima: "bg-red-100 text-red-700 border-red-200",
    Abaixo: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

interface HumanSilhouetteProps {
  side: "left" | "right";
  activeView: "lean" | "fat";
  segments: {
    arm: SegmentData;
    leg: SegmentData;
  };
}

function HumanSilhouette({ side, activeView, segments }: HumanSilhouetteProps) {
  const isLeft = side === "left";
  const color = activeView === "lean" ? "#3B82F6" : "#F97316";
  
  // Calcular intensidade da cor baseada no status
  const getOpacity = (status: string) => {
    if (status === "Normal") return 0.6;
    if (status === "Acima") return 0.9;
    return 0.4;
  };

  const armOpacity = getOpacity(segments.arm.status);
  const legOpacity = getOpacity(segments.leg.status);

  return (
    <svg
      viewBox="0 0 100 250"
      className="h-full w-full"
      style={{ transform: isLeft ? "scaleX(-1)" : "scaleX(1)" }}
    >
      {/* Head */}
      <motion.circle
        cx="50"
        cy="20"
        r="12"
        fill="#E5E7EB"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1 }}
      />

      {/* Neck */}
      <motion.rect
        x="47"
        y="30"
        width="6"
        height="8"
        fill="#E5E7EB"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.15 }}
      />

      {/* Trunk (será animado no componente TrunkSegmentCard) */}
      <motion.ellipse
        cx="50"
        cy="70"
        rx="20"
        ry="35"
        fill="#E5E7EB"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
      />

      {/* Arm - Right side of silhouette (animado) */}
      <motion.g
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: armOpacity, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {/* Upper arm */}
        <ellipse cx="72" cy="55" rx="6" ry="18" fill={color} />
        {/* Forearm */}
        <ellipse cx="76" cy="80" rx="5" ry="16" fill={color} opacity={0.8} />
        {/* Hand */}
        <ellipse cx="78" cy="100" rx="4" ry="6" fill={color} opacity={0.6} />
      </motion.g>

      {/* Leg - Right side of silhouette (animado) */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: legOpacity, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {/* Thigh */}
        <ellipse cx="60" cy="135" rx="8" ry="30" fill={color} />
        {/* Calf */}
        <ellipse cx="62" cy="185" rx="7" ry="28" fill={color} opacity={0.8} />
        {/* Foot */}
        <ellipse cx="64" cy="225" rx="8" ry="8" fill={color} opacity={0.6} />
      </motion.g>

      {/* Pulse effect no segmento problemático */}
      {segments.arm.status === "Acima" && (
        <motion.circle
          cx="72"
          cy="55"
          r="8"
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}

      {segments.leg.status === "Acima" && (
        <motion.circle
          cx="60"
          cy="135"
          r="10"
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </svg>
  );
}
