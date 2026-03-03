"use client";

import { motion } from "framer-motion";
import {
  UserCheck,
  BarChart3,
  Target,
  FileCheck,
} from "lucide-react";

const differentials = [
  {
    icon: UserCheck,
    title: "Atendimento Personalizado",
    description:
      "Cada paciente é único. Protocolos desenhados individualmente com base no seu perfil, objetivos e exames.",
    span: "md:col-span-2 md:row-span-2",
    featured: true,
  },
  {
    icon: BarChart3,
    title: "Avaliação por Bioimpedância",
    description:
      "Análise completa da composição corporal para decisões baseadas em dados precisos.",
    span: "",
    featured: false,
  },
  {
    icon: Target,
    title: "Acompanhamento Estratégico",
    description:
      "Monitoramento contínuo da evolução com ajustes baseados em indicadores reais.",
    span: "",
    featured: false,
  },
  {
    icon: FileCheck,
    title: "Protocolos Individualizados",
    description:
      "Medicações, dieta e treino integrados em um plano coerente e cientificamente embasado.",
    span: "md:col-span-2",
    featured: false,
  },
];

export function MethodGrid() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-elegant text-accent-gold text-lg mb-2 tracking-wider">
            Como Trabalhamos
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-accent-dark tracking-wide">
            MÉTODO E DIFERENCIAIS
          </h2>
        </motion.div>

        {/* Asymmetric Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {differentials.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                className={`${item.span} rounded-[var(--radius-xl)] p-8 border border-border-light
                  ${item.featured ? "bg-accent-dark text-white" : "bg-surface"}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className={`w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center mb-5
                  ${item.featured ? "bg-accent-gold/20" : "bg-accent-gold/10"}`}
                >
                  <Icon
                    size={24}
                    className={
                      item.featured ? "text-accent-gold-light" : "text-accent-gold"
                    }
                  />
                </div>
                <h3
                  className={`font-heading text-xl md:text-2xl tracking-wide mb-3
                  ${item.featured ? "text-white" : "text-accent-dark"}`}
                >
                  {item.title.toUpperCase()}
                </h3>
                <p
                  className={`text-sm leading-relaxed
                  ${item.featured ? "text-white/70" : "text-text-secondary"}`}
                >
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
