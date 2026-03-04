"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ArrowLeft, Save, Calculator, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PdfUploadBioimpedance } from "@/components/bioimpedance/PdfUpload";
import { BodySegmentIllustration, type SegmentTrendData } from "@/components/bioimpedance/BodySegmentIllustration";

interface BioimpedanceRecordSummary {
  muscle_mass?: number | null;
  body_fat_percentage?: number | null;
}

export default function BioimpedanciaAdminPage() {
  const params = useParams();
  const patientId = params.id as string;

  const [form, setForm] = useState({
    weight: "",
    height: "",
    bmi: "",
    body_fat_percentage: "",
    muscle_mass: "",
    bone_mass: "",
    visceral_fat: "",
    water_percentage: "",
    basal_metabolic_rate: "",
    metabolic_age: "",
    measurement_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [examId, setExamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [segmentTrends, setSegmentTrends] = useState<SegmentTrendData[]>([]);
  const [latestRecordData, setLatestRecordData] = useState<BioimpedanceRecordSummary | null>(null);

  // Fetch latest record to show analysis
  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch(`/api/patients/${patientId}/bioimpedance`);
        if (res.ok) {
          const _data = await res.json();
          if (data && data.length > 0) {
            setLatestRecordData(data[0]);
            setShowPreview(true);
            calculateSegmentTrends(data);
          }
        }
      } catch (err) {
        console.error("Error fetching bioimpedance:", err);
      }
    }
    fetchLatest();
  }, [patientId, success]);

  // Calculate trends between current and previous record
  function calculateSegmentTrends(records: BioimpedanceRecordSummary[]) {
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
      ? calculateChange(current.body_fat_percentage ?? undefined, previous.body_fat_percentage ?? undefined)
      : 0;

    const fat = current.body_fat_percentage ?? 0;
    const muscle = current.muscle_mass ?? 0;
    const isFatHigh    = fat > 30;
    const isFatBorder  = fat > 24 && fat <= 30;
    const isMuscleGood = muscle > 25;

    const getTypeNoTrend = (role: "arm" | "leg" | "torso") => {
      if (isFatHigh)    return "concern"  as const;
      if (isFatBorder)  return "fat"      as const;
      if (isMuscleGood) return "muscle"   as const;
      if (role === "torso" && muscle > 18) return "water" as const;
      return "stable" as const;
    };

    const getType = (role: "arm" | "leg" | "torso") => {
      if (!previous) return getTypeNoTrend(role);
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

  function updateField(field: string, value: string | number) {
    const valueStr = String(value);
    const newForm = { ...form, [field]: valueStr };

    // Auto-calculate BMI
    if (field === "weight" || field === "height") {
      const weight = parseFloat(field === "weight" ? valueStr : newForm.weight);
      const height = parseFloat(field === "height" ? valueStr : newForm.height);
      if (weight > 0 && height > 0) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        newForm.bmi = bmi.toFixed(2);
      }
    }

    setForm(newForm);
  }

  const isFormLocked = isLoading || isPdfProcessing;

  function handlePdfDataExtracted(
    extractedData: Record<string, string | number | null | undefined>,
    meta?: { examId?: string }
  ) {
    if (meta?.examId) {
      setExamId(meta.examId);
    }

    // Build the complete updated form in one pass to avoid stale closure
    setForm((prev) => {
      const next = { ...prev };
      for (const [key, value] of Object.entries(extractedData)) {
        const currentValue = (next as Record<string, string>)[key];
        if (
          value !== null &&
          value !== undefined &&
          key in next &&
          !currentValue &&
          (typeof value === "string" || typeof value === "number")
        ) {
          (next as Record<string, string>)[key] = String(value);
        }
      }
      // Auto-calculate BMI from extracted weight + height
      const w = parseFloat(next.weight);
      const h = parseFloat(next.height);
      if (w > 0 && h > 0) {
        next.bmi = (w / Math.pow(h / 100, 2)).toFixed(2);
      }
      return next;
    });
  }

  async function handleSave() {
    if (!form.weight) {
      setError("Peso é obrigatório");
      return;
    }

    if (!form.measurement_date) {
      setError("Data da medição é obrigatória");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/patients/${patientId}/bioimpedance/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            exam_id: examId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar bioimpedância");
      }

      setSuccess(result.message || "Bioimpedância salva com sucesso!");
      // Reset form after 2 seconds
      setTimeout(() => {
        setForm({
          weight: "",
          height: "",
          bmi: "",
          body_fat_percentage: "",
          muscle_mass: "",
          bone_mass: "",
          visceral_fat: "",
          water_percentage: "",
          basal_metabolic_rate: "",
          metabolic_age: "",
          measurement_date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        setExamId(null);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      console.error("Save error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/pacientes/${patientId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
            BIOIMPEDÂNCIA
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Inserir dados de composição corporal
          </p>
        </div>
      </div>

      {/* PDF Upload Section */}
      <Card className="mb-6">
        <PdfUploadBioimpedance
          patientId={patientId}
          onDataExtracted={handlePdfDataExtracted}
          isLoading={isLoading}
          onProcessingChange={setIsPdfProcessing}
        />
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Measures */}
        <Card>
          <h2 className="font-medium text-text-primary mb-6">
            Composição Corporal
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="weight"
                label="Peso (kg)"
                type="number"
                step="0.1"
                placeholder="75.0"
                value={form.weight}
                onChange={(e) => updateField("weight", e.target.value)}
                disabled={isFormLocked}
              />
              <Input
                id="height"
                label="Altura (cm)"
                type="number"
                step="0.1"
                placeholder="170.0"
                value={form.height}
                onChange={(e) => updateField("height", e.target.value)}
                disabled={isFormLocked}
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="bmi"
                label="IMC (auto)"
                type="number"
                step="0.01"
                value={form.bmi}
                onChange={(e) => updateField("bmi", e.target.value)}
                className="bg-surface/50"
                disabled={isFormLocked}
              />
              <div className="pt-6">
                <Calculator size={18} className="text-text-muted" />
              </div>
            </div>
            <Input
              id="body_fat_percentage"
              label="Gordura Corporal (%)"
              type="number"
              step="0.1"
              placeholder="25.0"
              value={form.body_fat_percentage}
              onChange={(e) =>
                updateField("body_fat_percentage", e.target.value)
              }
              disabled={isFormLocked}
            />
            <Input
              id="muscle_mass"
              label="Massa Muscular (kg)"
              type="number"
              step="0.1"
              placeholder="30.0"
              value={form.muscle_mass}
              onChange={(e) => updateField("muscle_mass", e.target.value)}
              disabled={isFormLocked}
            />
            <Input
              id="bone_mass"
              label="Massa Óssea (kg)"
              type="number"
              step="0.1"
              placeholder="3.0"
              value={form.bone_mass}
              onChange={(e) => updateField("bone_mass", e.target.value)}
              disabled={isFormLocked}
            />
            <Input
              id="water_percentage"
              label="Água Corporal (%)"
              type="number"
              step="0.1"
              placeholder="55.0"
              value={form.water_percentage}
              onChange={(e) =>
                updateField("water_percentage", e.target.value)
              }
              disabled={isFormLocked}
            />
          </div>
        </Card>

        {/* Metabolic + Meta */}
        <div className="space-y-6">
          <Card>
            <h2 className="font-medium text-text-primary mb-6">
              Dados Metabólicos
            </h2>
            <div className="space-y-4">
              <Input
                id="visceral_fat"
                label="Gordura Visceral"
                type="number"
                placeholder="10"
                value={form.visceral_fat}
                onChange={(e) => updateField("visceral_fat", e.target.value)}
                disabled={isFormLocked}
              />
              <Input
                id="basal_metabolic_rate"
                label="Taxa Metabólica Basal (kcal/dia)"
                type="number"
                placeholder="1500"
                value={form.basal_metabolic_rate}
                onChange={(e) =>
                  updateField("basal_metabolic_rate", e.target.value)
                }
                disabled={isFormLocked}
              />
              <Input
                id="metabolic_age"
                label="Idade Metabólica"
                type="number"
                placeholder="35"
                value={form.metabolic_age}
                onChange={(e) => updateField("metabolic_age", e.target.value)}
                disabled={isFormLocked}
              />
            </div>
          </Card>

          <Card>
            <h2 className="font-medium text-text-primary mb-6">
              Data e Observações
            </h2>
            <div className="space-y-4">
              <Input
                id="measurement_date"
                label="Data da Medição"
                type="date"
                value={form.measurement_date}
                onChange={(e) =>
                  updateField("measurement_date", e.target.value)
                }
                disabled={isFormLocked}
              />
              <Textarea
                id="notes"
                label="Observações"
                placeholder="Notas adicionais sobre a medição..."
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                disabled={isFormLocked}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Save */}
      <div className="flex flex-col gap-4 mt-6">
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}


      {/* Análise Segmentar Preview - New Avatar */}
      {showPreview && latestRecordData && segmentTrends.length > 0 && (
        <div className="mt-8">
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Análise Corporal Segmentar
              </h2>
              <p className="text-sm text-text-muted mt-1">
                Visualização interativa da composição corporal por região
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
                    Total:{" "}
                    <span className="font-semibold text-text-primary">
                      {latestRecordData.muscle_mass?.toFixed(1)} kg
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
        {success && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            variant="premium"
            onClick={handleSave}
            className="gap-2"
            disabled={isFormLocked}
          >
            <Save size={16} />
            {isPdfProcessing ? "Processando PDF..." : isLoading ? "Salvando..." : "Salvar Registro"}
          </Button>
        </div>
      </div>
    </div>
  );
}
