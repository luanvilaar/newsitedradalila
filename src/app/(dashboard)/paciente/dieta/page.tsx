"use client";

import { Card } from "@/components/ui/Card";
import { Utensils } from "lucide-react";

export default function DietaPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
          DIETA
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Seu plano alimentar prescrito.
        </p>
      </div>

      <Card>
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
            <Utensils size={28} className="text-text-muted" />
          </div>
          <p className="text-text-secondary text-sm font-medium">
            Nenhum plano alimentar prescrito
          </p>
          <p className="text-text-muted text-xs mt-2 max-w-sm mx-auto">
            Seu plano alimentar com refeições, macros e orientações aparecerão aqui.
          </p>
        </div>
      </Card>
    </div>
  );
}
