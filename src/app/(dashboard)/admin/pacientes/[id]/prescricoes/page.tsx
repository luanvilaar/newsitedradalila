"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ArrowLeft, Save, Pill, Utensils, Dumbbell } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type PrescriptionType = "medication" | "diet" | "workout";

const typeConfig = {
  medication: {
    icon: Pill,
    label: "Medicamento",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  diet: {
    icon: Utensils,
    label: "Dieta",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  workout: {
    icon: Dumbbell,
    label: "Treino",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
};

export default function PrescricoesPage() {
  const params = useParams();
  const patientId = params.id as string;
  const [type, setType] = useState<PrescriptionType>("medication");

  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    // Medication
    drug: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    // Diet
    diet_plan: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    diet_restrictions: "",
    // Workout
    workout_routine: "",
    workout_frequency: "",
    workout_duration: "",
    workout_intensity: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    if (!form.title || !form.start_date) {
      setSaveError("Título e data de início são obrigatórios.");
      setSaving(false);
      return;
    }

    try {
      const typeDetails: Record<string, any> = {};

      if (type === "medication") {
        typeDetails.medication_details = {
          drug: form.drug,
          dosage: form.dosage,
          frequency: form.frequency,
          duration: form.duration,
          instructions: form.instructions,
        };
      } else if (type === "diet") {
        typeDetails.diet_details = {
          diet_plan: form.diet_plan,
          calories: form.calories ? Number(form.calories) : null,
          protein: form.protein ? Number(form.protein) : null,
          carbs: form.carbs ? Number(form.carbs) : null,
          fat: form.fat ? Number(form.fat) : null,
          restrictions: form.diet_restrictions,
        };
      } else if (type === "workout") {
        typeDetails.workout_details = {
          routine: form.workout_routine,
          frequency: form.workout_frequency,
          duration: form.workout_duration,
          intensity: form.workout_intensity,
        };
      }

      const payload = {
        type,
        title: form.title,
        description: form.description,
        start_date: form.start_date,
        end_date: form.end_date || null,
        status: "active",
        ...typeDetails,
      };

      const res = await fetch(`/api/patients/${patientId}/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const _data = await res.json();
        throw new Error(data.error || "Erro ao salvar prescrição");
      }

      setSaveSuccess(true);
      setForm({
        title: "",
        description: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        drug: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        diet_plan: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        diet_restrictions: "",
        workout_routine: "",
        workout_frequency: "",
        workout_duration: "",
        workout_intensity: "",
      });
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Erro ao salvar prescrição"
      );
    } finally {
      setSaving(false);
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
            NOVA PRESCRIÇÃO
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Criar prescrição para o paciente
          </p>
        </div>
      </div>

      {/* Type Selector */}
      <div className="flex gap-3 mb-8">
        {(Object.keys(typeConfig) as PrescriptionType[]).map((t) => {
          const config = typeConfig[t];
          const Icon = config.icon;
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex items-center gap-2 px-5 py-3 rounded-[var(--radius-lg)] border text-sm font-medium transition-all cursor-pointer ${
                type === t
                  ? "bg-accent-gold/10 border-accent-gold text-accent-gold-dark"
                  : "border-border text-text-secondary hover:bg-surface"
              }`}
            >
              <Icon size={18} />
              {config.label}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General Info */}
        <Card>
          <h2 className="font-medium text-text-primary mb-6">
            Informações Gerais
          </h2>
          <div className="space-y-4">
            <Input
              id="title"
              label="Título"
              placeholder={`Nome da prescrição de ${typeConfig[type].label.toLowerCase()}...`}
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
            <Textarea
              id="description"
              label="Descrição"
              placeholder="Descrição detalhada..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="start_date"
                label="Início"
                type="date"
                value={form.start_date}
                onChange={(e) => updateField("start_date", e.target.value)}
              />
              <Input
                id="end_date"
                label="Término"
                type="date"
                value={form.end_date}
                onChange={(e) => updateField("end_date", e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Type-specific fields */}
        <Card>
          <h2 className="font-medium text-text-primary mb-6">
            Detalhes — {typeConfig[type].label}
          </h2>

          {type === "medication" && (
            <div className="space-y-4">
              <Input
                id="drug"
                label="Medicamento"
                placeholder="Nome do medicamento..."
                value={form.drug}
                onChange={(e) => updateField("drug", e.target.value)}
              />
              <Input
                id="dosage"
                label="Dosagem"
                placeholder="Ex: 500mg"
                value={form.dosage}
                onChange={(e) => updateField("dosage", e.target.value)}
              />
              <Input
                id="frequency"
                label="Frequência"
                placeholder="Ex: 2x ao dia"
                value={form.frequency}
                onChange={(e) => updateField("frequency", e.target.value)}
              />
              <Input
                id="duration"
                label="Duração"
                placeholder="Ex: 30 dias"
                value={form.duration}
                onChange={(e) => updateField("duration", e.target.value)}
              />
              <Textarea
                id="instructions"
                label="Instruções"
                placeholder="Orientações especiais..."
                value={form.instructions}
                onChange={(e) => updateField("instructions", e.target.value)}
              />
            </div>
          )}

          {type === "diet" && (
            <div className="space-y-4">
              <Textarea
                id="diet_plan"
                label="Plano Alimentar"
                placeholder="Descreva o plano alimentar detalhado..."
                className="min-h-[150px]"
                value={form.diet_plan}
                onChange={(e) => updateField("diet_plan", e.target.value)}
              />
              <Input
                id="calories"
                label="Calorias Diárias (kcal)"
                type="number"
                placeholder="2000"
                value={form.calories}
                onChange={(e) => updateField("calories", e.target.value)}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input
                  id="protein"
                  label="Proteína (g)"
                  type="number"
                  placeholder="150"
                  value={form.protein}
                  onChange={(e) => updateField("protein", e.target.value)}
                />
                <Input
                  id="carbs"
                  label="Carboidrato (g)"
                  type="number"
                  placeholder="200"
                  value={form.carbs}
                  onChange={(e) => updateField("carbs", e.target.value)}
                />
                <Input
                  id="fat"
                  label="Gordura (g)"
                  type="number"
                  placeholder="60"
                  value={form.fat}
                  onChange={(e) => updateField("fat", e.target.value)}
                />
              </div>
              <Textarea
                id="diet_restrictions"
                label="Restrições"
                placeholder="Restrições alimentares..."
                value={form.diet_restrictions}
                onChange={(e) =>
                  updateField("diet_restrictions", e.target.value)
                }
              />
            </div>
          )}

          {type === "workout" && (
            <div className="space-y-4">
              <Textarea
                id="workout_routine"
                label="Rotina de Treino"
                placeholder="Descreva exercícios, séries, repetições..."
                className="min-h-[150px]"
                value={form.workout_routine}
                onChange={(e) =>
                  updateField("workout_routine", e.target.value)
                }
              />
              <Input
                id="workout_frequency"
                label="Frequência"
                placeholder="Ex: 5x por semana"
                value={form.workout_frequency}
                onChange={(e) =>
                  updateField("workout_frequency", e.target.value)
                }
              />
              <Input
                id="workout_duration"
                label="Duração"
                placeholder="Ex: 60 min por sessão"
                value={form.workout_duration}
                onChange={(e) =>
                  updateField("workout_duration", e.target.value)
                }
              />
              <Input
                id="workout_intensity"
                label="Intensidade"
                placeholder="Ex: Moderada a Alta"
                value={form.workout_intensity}
                onChange={(e) =>
                  updateField("workout_intensity", e.target.value)
                }
              />
            </div>
          )}
        </Card>
      </div>

      {/* Save Feedback */}
      {saveSuccess && (
        <Card className="mt-6 border border-success/20 bg-success/5">
          <p className="text-success text-sm">Prescrição salva com sucesso!</p>
        </Card>
      )}
      {saveError && (
        <Card className="mt-6 border border-error/20 bg-error/5">
          <p className="text-error text-sm">{saveError}</p>
        </Card>
      )}

      {/* Save */}
      <div className="flex justify-end mt-6">
        <Button
          variant="premium"
          onClick={handleSave}
          className="gap-2"
          disabled={saving}
        >
          <Save size={16} />
          {saving ? "Salvando..." : "Salvar Prescrição"}
        </Button>
      </div>
    </div>
  );
}
