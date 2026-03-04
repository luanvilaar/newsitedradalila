import { SegmentalBodyAnalysis } from "@/components/bioimpedance/SegmentalBodyAnalysis";

# Exemplo de Uso - Análise Corporal Segmentar

## Caso 1: Dados Padrão (Demo)

```tsx
export function BioimpedanceDemo() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Análise Segmentar - Demo
      </h2>
      
      {/* Usa dados padrão da segunda captura de tela */}
      <SegmentalBodyAnalysis />
    </div>
  );
}
```

## Caso 2: Dados Personalizados do Paciente

```tsx
import { useEffect, useState } from "react";
import { SegmentalBodyAnalysis } from "@/components/bioimpedance/SegmentalBodyAnalysis";

interface PatientSegmentalProps {
  patientId: string;
}

export function PatientSegmentalView({ patientId }: PatientSegmentalProps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/patients/${patientId}/bioimpedance/latest`);
        const record = await res.json();
        
        // Extrair dados segmentares do JSON
        if (record.segmental_analysis) {
          setData({
            leanMass: record.segmental_analysis.lean_mass,
            fatMass: record.segmental_analysis.fat_mass,
          });
        }
      } catch (error) {
        console.error("Failed to load segmental data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [patientId]);

  if (loading) {
    return <div>Carregando análise...</div>;
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Nenhum dado de análise segmentar disponível</p>
        <p className="text-sm mt-2">
          Realize uma nova bioimpedância para visualizar
        </p>
      </div>
    );
  }

  return (
    <SegmentalBodyAnalysis 
      leanMass={data.leanMass}
      fatMass={data.fatMass}
    />
  );
}
```

## Caso 3: Comparação Antes/Depois

```tsx
import { useState } from "react";
import { SegmentalBodyAnalysis } from "@/components/bioimpedance/SegmentalBodyAnalysis";
import { Button } from "@/components/ui/Button";

interface ComparisonData {
  date: string;
  leanMass: SegmentalData;
  fatMass: SegmentalData;
}

export function BeforeAfterComparison({ 
  before, 
  after 
}: { 
  before: ComparisonData; 
  after: ComparisonData; 
}) {
  const [view, setView] = useState<"before" | "after">("after");
  
  const current = view === "before" ? before : after;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Evolução da Composição</h2>
        
        <div className="flex gap-2">
          <Button
            variant={view === "before" ? "premium" : "ghost"}
            onClick={() => setView("before")}
          >
            Antes ({new Date(before.date).toLocaleDateString()})
          </Button>
          <Button
            variant={view === "after" ? "premium" : "ghost"}
            onClick={() => setView("after")}
          >
            Depois ({new Date(after.date).toLocaleDateString()})
          </Button>
        </div>
      </div>

      <SegmentalBodyAnalysis
        leanMass={current.leanMass}
        fatMass={current.fatMass}
      />
    </div>
  );
}
```

## Caso 4: Card Compacto (Dashboard)

```tsx
import { SegmentalBodyAnalysis } from "@/components/bioimpedance/SegmentalBodyAnalysis";
import { Card } from "@/components/ui/Card";

export function CompactSegmentalCard() {
  return (
    <Card className="p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Análise Segmentar
        </h3>
        <p className="text-xs text-gray-500">
          Última medição
        </p>
      </div>
      
      <div className="scale-90 origin-top-left">
        <SegmentalBodyAnalysis />
      </div>
    </Card>
  );
}
```

## Caso 5: Modal/Dialog Full Screen

```tsx
import { useState } from "react";
import { SegmentalBodyAnalysis } from "@/components/bioimpedance/SegmentalBodyAnalysis";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Maximize2 } from "lucide-react";

export function SegmentalModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Maximize2 size={16} />
        Ver Análise Completa
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Análise Corporal Segmentar Completa"
        size="xl"
      >
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <SegmentalBodyAnalysis />
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              Interpretação
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Valores "Normal" indicam composição dentro da faixa esperada</li>
              <li>• Valores "Acima" podem indicar acúmulo excessivo</li>
              <li>• Assimetrias significativas entre lados podem requerer atenção</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
}
```

## Caso 6: Print/Export View

```tsx
import { useRef } from "react";
import { SegmentalBodyAnalysis } from "@/components/bioimpedance/SegmentalBodyAnalysis";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function ExportableSegmental({ patientName }: { patientName: string }) {
  const printRef = useRef<HTMLDivElement>(null);

  async function handleExport() {
    if (!printRef.current) return;

    const canvas = await html2canvas(printRef.current);
    const imgData = canvas.toDataURL("image/png");
    
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`analise-segmentar-${patientName}.pdf`);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Análise Segmentar - {patientName}
        </h2>
        <Button onClick={handleExport} className="gap-2">
          <Download size={16} />
          Exportar PDF
        </Button>
      </div>

      <div ref={printRef} className="bg-white p-6">
        <SegmentalBodyAnalysis />
        
        <div className="mt-6 text-xs text-gray-500 border-t pt-4">
          <p>Gerado em: {new Date().toLocaleString("pt-BR")}</p>
          <p>Sistema DT - Análise de Composição Corporal</p>
        </div>
      </div>
    </div>
  );
}
```

## Props do Componente

```typescript
interface SegmentalBodyAnalysisProps {
  // Dados de massa magra por segmento
  leanMass?: SegmentalData;
  
  // Dados de gordura por segmento
  fatMass?: SegmentalData;
  
  // Classes CSS adicionais
  className?: string;
}

// Se não fornecido, usa dados padrão da demo
```

## Estrutura de SegmentalData

```typescript
interface SegmentData {
  value: number;        // Valor em kg
  percentage: number;   // Percentual (100 = normal)
  status: "Normal" | "Acima" | "Abaixo";
}

interface SegmentalData {
  leftArm: SegmentData;
  rightArm: SegmentData;
  trunk: SegmentData;
  leftLeg: SegmentData;
  rightLeg: SegmentData;
}
```

## Exemplo de Dados Reais

```typescript
const realPatientData = {
  leanMass: {
    leftArm: { value: 2.10, percentage: 108.7, status: "Normal" },
    rightArm: { value: 2.10, percentage: 108.7, status: "Normal" },
    trunk: { value: 19.2, percentage: 90.4, status: "Normal" },
    leftLeg: { value: 7.21, percentage: 98.8, status: "Normal" },
    rightLeg: { value: 7.11, percentage: 98.0, status: "Normal" },
  },
  fatMass: {
    leftArm: { value: 1.3, percentage: 127.4, status: "Normal" },
    rightArm: { value: 1.3, percentage: 127.3, status: "Normal" },
    trunk: { value: 9.1, percentage: 165.8, status: "Acima" },
    leftLeg: { value: 3.0, percentage: 120.1, status: "Normal" },
    rightLeg: { value: 3.0, percentage: 120.2, status: "Normal" },
  },
};
```

## Estilização Customizada

```tsx
// Tema escuro
<div className="bg-gray-900 p-6 rounded-lg">
  <SegmentalBodyAnalysis className="[&_div]:bg-gray-800 [&_p]:text-gray-100" />
</div>

// Bordas arredondadas
<SegmentalBodyAnalysis className="rounded-3xl overflow-hidden" />

// Escala maior
<div className="scale-125 transform origin-top">
  <SegmentalBodyAnalysis />
</div>
```
