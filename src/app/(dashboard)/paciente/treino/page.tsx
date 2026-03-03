"use client";

import { Card } from "@/components/ui/Card";
import { Dumbbell } from "lucide-react";

export default function TreinoPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
          TREINO
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Seu programa de treinamento prescrito.
        </p>
      </div>

      <Card>
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
            <Dumbbell size={28} className="text-text-muted" />
          </div>
          <p className="text-text-secondary text-sm font-medium">
            Nenhum treino prescrito
          </p>
          <p className="text-text-muted text-xs mt-2 max-w-sm mx-auto">
            Seu programa semanal de treino com exercícios, séries e repetições aparecerão aqui.
          </p>
        </div>
      </Card>
    </div>
  );
}
