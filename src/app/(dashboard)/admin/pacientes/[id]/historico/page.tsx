"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function HistoricoPage() {
  const params = useParams();
  const patientId = params.id as string;

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
            HISTÓRICO EVOLUTIVO
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Timeline completa do paciente
          </p>
        </div>
      </div>

      <Card>
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
            <Clock size={28} className="text-text-muted" />
          </div>
          <p className="text-text-secondary text-sm font-medium">
            Nenhum evento registrado
          </p>
          <p className="text-text-muted text-xs mt-2 max-w-sm mx-auto">
            Todas as interações médicas — consultas, anamneses, prescrições, bioimpedâncias e documentos — aparecerão aqui em ordem cronológica.
          </p>
        </div>
      </Card>
    </div>
  );
}
