"use client";

import { useState } from "react";
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Heart,
  Droplets,
  Dumbbell,
  Flame,
  Bone,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// ── Types ─────────────────────────────────────────────────────────────

interface AiAnalysisData {
  extractedData: {
    weight: number | null;
    height: number | null;
    bmi: number | null;
    body_fat_percentage: number | null;
    muscle_mass: number | null;
    skeletal_muscle_mass: number | null;
    bone_mass: number | null;
    visceral_fat: number | null;
    water_percentage: number | null;
    basal_metabolic_rate: number | null;
    metabolic_age: number | null;
    measurement_date: string | null;
    segmental_lean?: Record<string, number>;
    segmental_fat?: Record<string, number>;
  };
  insights: string[];
  healthScore: number | null;
  recommendations: string[];
  summary: string;
  confidence: number;
  deviceDetected: string | null;
  fieldsExtracted: string[];
}

interface AiPdfAnalysisProps {
  examId: string;
  /** Pre-loaded analysis (from upload response) */
  initialAnalysis?: AiAnalysisData | null;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────

export function AiPdfAnalysis({
  examId,
  initialAnalysis = null,
  className = "",
}: AiPdfAnalysisProps) {
  const [analysis, setAnalysis] = useState<AiAnalysisData | null>(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  async function runAnalysis() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bioimpedance/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao analisar com IA");
      }

      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  // No analysis yet — show trigger button
  if (!analysis && !loading) {
    return (
      <Card className={`border border-dashed border-accent-gold/30 ${className}`}>
        <div className="text-center py-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
            <Brain size={28} className="text-violet-600" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-2">
            Análise por Inteligência Artificial
          </h3>
          <p className="text-sm text-text-secondary mb-4 max-w-md mx-auto">
            Use IA para extrair automaticamente todos os dados do PDF e receber
            insights clínicos personalizados sobre a composição corporal.
          </p>
          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}
          <Button
            onClick={runAnalysis}
            className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
          >
            <Sparkles size={16} />
            Analisar com IA
          </Button>
        </div>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card className={`border border-violet-200 ${className}`}>
        <div className="text-center py-10">
          <Loader2 size={32} className="mx-auto mb-3 text-violet-600 animate-spin" />
          <p className="font-medium text-text-primary mb-1">
            Analisando exame com IA...
          </p>
          <p className="text-sm text-text-secondary">
            Extraindo dados e gerando insights clínicos
          </p>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  const d = analysis.extractedData;
  const healthColor = getHealthScoreColor(analysis.healthScore);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Card — Score + Summary */}
      <Card className="border border-violet-200 bg-gradient-to-br from-violet-50/50 to-indigo-50/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-base">
                Análise IA
              </h3>
              <p className="text-xs text-text-secondary">
                {analysis.deviceDetected && (
                  <span className="mr-2">📟 {analysis.deviceDetected}</span>
                )}
                Confiança: {Math.round(analysis.confidence * 100)}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runAnalysis}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw size={14} />
              Re-analisar
            </Button>
          </div>
        </div>

        {/* Health Score */}
        {analysis.healthScore != null && (
          <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-white/60">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke={healthColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(analysis.healthScore / 100) * 97.4} 97.4`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: healthColor }}>
                {analysis.healthScore}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">
                Score de Saúde Corporal
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                {getHealthLabel(analysis.healthScore)}
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        {analysis.summary && (
          <p className="text-sm text-text-secondary leading-relaxed">
            {analysis.summary}
          </p>
        )}
      </Card>

      {/* Extracted Values Grid */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-text-primary flex items-center gap-2">
            <Sparkles size={16} className="text-violet-500" />
            Dados Extraídos pela IA
          </h4>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            {showDetails ? "Menos detalhes" : "Mais detalhes"}
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <MetricTile
            icon={<Activity size={16} />}
            label="Peso"
            value={d.weight}
            unit="kg"
            color="blue"
          />
          <MetricTile
            icon={<TrendingUp size={16} />}
            label="IMC"
            value={d.bmi}
            unit=""
            color={getBmiColor(d.bmi)}
          />
          <MetricTile
            icon={<Flame size={16} />}
            label="Gordura"
            value={d.body_fat_percentage}
            unit="%"
            color="orange"
          />
          <MetricTile
            icon={<Dumbbell size={16} />}
            label="Massa Muscular"
            value={d.muscle_mass}
            unit="kg"
            color="green"
          />
          {showDetails && (
            <>
              <MetricTile
                icon={<Dumbbell size={16} />}
                label="M. Esq. Esquelética"
                value={d.skeletal_muscle_mass}
                unit="kg"
                color="green"
              />
              <MetricTile
                icon={<Bone size={16} />}
                label="Massa Óssea"
                value={d.bone_mass}
                unit="kg"
                color="gray"
              />
              <MetricTile
                icon={<AlertTriangle size={16} />}
                label="Gordura Visceral"
                value={d.visceral_fat}
                unit=""
                color={d.visceral_fat && d.visceral_fat > 12 ? "red" : "green"}
              />
              <MetricTile
                icon={<Droplets size={16} />}
                label="Água Corporal"
                value={d.water_percentage}
                unit="%"
                color="cyan"
              />
              <MetricTile
                icon={<Flame size={16} />}
                label="Taxa Metabólica"
                value={d.basal_metabolic_rate}
                unit="kcal"
                color="amber"
              />
              <MetricTile
                icon={<Heart size={16} />}
                label="Idade Metabólica"
                value={d.metabolic_age}
                unit="anos"
                color="pink"
              />
              <MetricTile
                icon={<TrendingUp size={16} />}
                label="Altura"
                value={d.height}
                unit="cm"
                color="blue"
              />
            </>
          )}
        </div>

        {/* Segmental data preview */}
        {showDetails && d.segmental_lean && (
          <div className="mt-4 pt-4 border-t border-border-light">
            <h5 className="text-sm font-medium text-text-primary mb-3">
              Dados Segmentares (Massa Magra)
            </h5>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                ["B. Esq.", d.segmental_lean.leftArm],
                ["B. Dir.", d.segmental_lean.rightArm],
                ["Tronco", d.segmental_lean.trunk],
                ["P. Esq.", d.segmental_lean.leftLeg],
                ["P. Dir.", d.segmental_lean.rightLeg],
              ].map(([label, val]) => (
                <div key={label as string} className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-[10px] text-text-muted">{label as string}</p>
                  <p className="text-sm font-semibold text-blue-700">
                    {val != null ? `${(val as number).toFixed(1)}kg` : "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {showDetails && d.segmental_fat && (
          <div className="mt-3">
            <h5 className="text-sm font-medium text-text-primary mb-3">
              Dados Segmentares (Gordura)
            </h5>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                ["B. Esq.", d.segmental_fat.leftArm],
                ["B. Dir.", d.segmental_fat.rightArm],
                ["Tronco", d.segmental_fat.trunk],
                ["P. Esq.", d.segmental_fat.leftLeg],
                ["P. Dir.", d.segmental_fat.rightLeg],
              ].map(([label, val]) => (
                <div key={label as string} className="p-2 bg-orange-50 rounded-lg">
                  <p className="text-[10px] text-text-muted">{label as string}</p>
                  <p className="text-sm font-semibold text-orange-700">
                    {val != null ? `${(val as number).toFixed(1)}kg` : "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <Card>
          <h4 className="font-medium text-text-primary mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            Insights Clínicos
          </h4>
          <ul className="space-y-2">
            {analysis.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-text-secondary">{insight}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card className="border border-amber-200 bg-amber-50/30">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="w-full flex items-center justify-between"
          >
            <h4 className="font-medium text-text-primary flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Recomendações ({analysis.recommendations.length})
            </h4>
            {showRecommendations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showRecommendations && (
            <ul className="mt-3 space-y-2">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <TrendingDown size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">{rec}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function MetricTile({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null | undefined;
  unit: string;
  color: string;
}) {
  if (value == null) return null;

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    red: "bg-red-50 text-red-700",
    cyan: "bg-cyan-50 text-cyan-700",
    amber: "bg-amber-50 text-amber-700",
    pink: "bg-pink-50 text-pink-700",
    gray: "bg-gray-50 text-gray-700",
  };

  const classes = colorMap[color] || colorMap.blue;

  return (
    <div className={`p-3 rounded-lg ${classes}`}>
      <div className="flex items-center gap-1.5 mb-1 opacity-70">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-lg font-bold">
        {typeof value === "number" ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
        {unit && <span className="text-xs font-normal ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────

function getHealthScoreColor(score: number | null): string {
  if (score == null) return "#9ca3af";
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getHealthLabel(score: number | null): string {
  if (score == null) return "Não avaliado";
  if (score >= 80) return "Excelente composição corporal";
  if (score >= 60) return "Boa composição corporal, com espaço para melhorias";
  if (score >= 40) return "Composição corporal moderada, atenção recomendada";
  return "Composição corporal requer atenção médica";
}

function getBmiColor(bmi: number | null): string {
  if (bmi == null) return "gray";
  if (bmi < 18.5) return "cyan";
  if (bmi < 25) return "green";
  if (bmi < 30) return "orange";
  return "red";
}
