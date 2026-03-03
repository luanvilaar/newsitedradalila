"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ArrowLeft, Save, Calculator, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PdfUploadBioimpedance } from "@/components/bioimpedance/PdfUpload";

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  function handlePdfDataExtracted(extractedData: any) {
    // Update form with extracted data
    Object.entries(extractedData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key in form) {
        // Only update if value is a string or number
        if (typeof value === "string" || typeof value === "number") {
          updateField(key, value);
        }
      }
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
          body: JSON.stringify(form),
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
              />
              <Input
                id="height"
                label="Altura (cm)"
                type="number"
                step="0.1"
                placeholder="170.0"
                value={form.height}
                onChange={(e) => updateField("height", e.target.value)}
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
            />
            <Input
              id="muscle_mass"
              label="Massa Muscular (kg)"
              type="number"
              step="0.1"
              placeholder="30.0"
              value={form.muscle_mass}
              onChange={(e) => updateField("muscle_mass", e.target.value)}
            />
            <Input
              id="bone_mass"
              label="Massa Óssea (kg)"
              type="number"
              step="0.1"
              placeholder="3.0"
              value={form.bone_mass}
              onChange={(e) => updateField("bone_mass", e.target.value)}
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
              />
              <Input
                id="metabolic_age"
                label="Idade Metabólica"
                type="number"
                placeholder="35"
                value={form.metabolic_age}
                onChange={(e) => updateField("metabolic_age", e.target.value)}
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
              />
              <Textarea
                id="notes"
                label="Observações"
                placeholder="Notas adicionais sobre a medição..."
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
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
            disabled={isLoading}
          >
            <Save size={16} />
            {isLoading ? "Salvando..." : "Salvar Registro"}
          </Button>
        </div>
      </div>
    </div>
  );
}
