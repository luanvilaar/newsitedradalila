"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ArrowLeft, ChevronRight, ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const steps = [
  "Queixa Principal",
  "Histórico Médico",
  "Histórico Familiar e Social",
  "Revisão de Sistemas",
  "Específico por Especialidade",
];

export default function AnamnesePage() {
  const params = useParams();
  const patientId = params.id as string;
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [form, setForm] = useState({
    chief_complaint: "",
    history_present_illness: "",
    past_medical_history: "",
    surgeries: "",
    medications: "",
    allergies: "",
    family_history: "",
    smoking_status: "never" as "never" | "former" | "current",
    alcohol_use: "",
    exercise_frequency: "",
    diet_pattern: "",
    hormonal_history: "",
    obesity_notes: "",
    performance_goals: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function nextStep() {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  }

  function prevStep() {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  function handleSave() {
    // TODO: Save to Supabase
    console.log("Saving anamnesis:", form);
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
            ANAMNESE
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Registro de histórico médico do paciente
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setCurrentStep(i)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  i <= currentStep
                    ? "bg-accent-gold text-white"
                    : "bg-surface text-text-muted"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`hidden md:block text-xs ${
                  i <= currentStep ? "text-text-primary" : "text-text-muted"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full h-1 bg-surface rounded-full">
          <div
            className="h-1 bg-accent-gold rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <h2 className="font-medium text-text-primary mb-6">
          {steps[currentStep]}
        </h2>

        {/* Step 1: Chief Complaint */}
        {currentStep === 0 && (
          <div className="space-y-5">
            <Textarea
              id="chief_complaint"
              label="Queixa Principal"
              placeholder="Descreva a queixa principal do paciente..."
              value={form.chief_complaint}
              onChange={(e) => updateField("chief_complaint", e.target.value)}
            />
            <Textarea
              id="history_present_illness"
              label="História da Doença Atual"
              placeholder="Descreva a cronologia e evolução dos sintomas..."
              value={form.history_present_illness}
              onChange={(e) =>
                updateField("history_present_illness", e.target.value)
              }
            />
          </div>
        )}

        {/* Step 2: Medical History */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <Textarea
              id="past_medical_history"
              label="Doenças Prévias"
              placeholder="Diabetes, hipertensão, hipotireoidismo..."
              value={form.past_medical_history}
              onChange={(e) =>
                updateField("past_medical_history", e.target.value)
              }
            />
            <Textarea
              id="surgeries"
              label="Cirurgias"
              placeholder="Liste as cirurgias realizadas..."
              value={form.surgeries}
              onChange={(e) => updateField("surgeries", e.target.value)}
            />
            <Textarea
              id="medications"
              label="Medicamentos em Uso"
              placeholder="Liste os medicamentos e dosagens..."
              value={form.medications}
              onChange={(e) => updateField("medications", e.target.value)}
            />
            <Textarea
              id="allergies"
              label="Alergias"
              placeholder="Medicamentos, alimentos, substâncias..."
              value={form.allergies}
              onChange={(e) => updateField("allergies", e.target.value)}
            />
          </div>
        )}

        {/* Step 3: Family & Social */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <Textarea
              id="family_history"
              label="Histórico Familiar"
              placeholder="Doenças hereditárias, condições familiares..."
              value={form.family_history}
              onChange={(e) => updateField("family_history", e.target.value)}
            />
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                Tabagismo
              </label>
              <div className="flex gap-3">
                {[
                  { value: "never", label: "Nunca fumou" },
                  { value: "former", label: "Ex-fumante" },
                  { value: "current", label: "Fumante" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateField("smoking_status", opt.value)}
                    className={`px-4 py-2 rounded-[var(--radius-md)] text-sm border transition-colors cursor-pointer ${
                      form.smoking_status === opt.value
                        ? "bg-accent-gold/10 border-accent-gold text-accent-gold-dark"
                        : "border-border text-text-secondary hover:bg-surface"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <Input
              id="alcohol_use"
              label="Consumo de Álcool"
              placeholder="Frequência e quantidade..."
              value={form.alcohol_use}
              onChange={(e) => updateField("alcohol_use", e.target.value)}
            />
            <Input
              id="exercise_frequency"
              label="Atividade Física"
              placeholder="Tipo, frequência e duração..."
              value={form.exercise_frequency}
              onChange={(e) =>
                updateField("exercise_frequency", e.target.value)
              }
            />
            <Input
              id="diet_pattern"
              label="Padrão Alimentar"
              placeholder="Descreva o padrão alimentar atual..."
              value={form.diet_pattern}
              onChange={(e) => updateField("diet_pattern", e.target.value)}
            />
          </div>
        )}

        {/* Step 4: Review of Systems */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <p className="text-text-muted text-sm mb-4">
              Revise os principais sistemas e registre alterações encontradas.
            </p>
            {[
              "Cardiovascular",
              "Respiratório",
              "Gastrointestinal",
              "Endócrino",
              "Musculoesquelético",
              "Neurológico",
              "Dermatológico",
              "Genitourinário",
            ].map((system) => (
              <Textarea
                key={system}
                id={`ros_${system.toLowerCase()}`}
                label={system}
                placeholder={`Observações sobre o sistema ${system.toLowerCase()}...`}
                className="min-h-[60px]"
              />
            ))}
          </div>
        )}

        {/* Step 5: Specialty-Specific */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <Textarea
              id="hormonal_history"
              label="Histórico Hormonal"
              placeholder="Ciclo menstrual, uso de hormônios, sintomas de desregulação..."
              value={form.hormonal_history}
              onChange={(e) => updateField("hormonal_history", e.target.value)}
            />
            <Textarea
              id="obesity_notes"
              label="Dados de Obesidade"
              placeholder="Histórico de peso, tentativas de emagrecimento, IMC..."
              value={form.obesity_notes}
              onChange={(e) => updateField("obesity_notes", e.target.value)}
            />
            <Textarea
              id="performance_goals"
              label="Objetivos de Performance"
              placeholder="Metas esportivas, nível de atividade, competições..."
              value={form.performance_goals}
              onChange={(e) =>
                updateField("performance_goals", e.target.value)
              }
            />
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft size={16} />
          Anterior
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button variant="primary" onClick={nextStep} className="gap-2">
            Próximo
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button variant="premium" onClick={handleSave} className="gap-2">
            <Save size={16} />
            Salvar Anamnese
          </Button>
        )}
      </div>
    </div>
  );
}
