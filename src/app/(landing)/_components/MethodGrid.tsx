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
                className={`${item.span} rounded-[var(--radius-xl)] p-8 border transition-all duration-300 cursor-default group
                  ${item.featured
                    ? "bg-accent-dark text-white border-accent-gold/30 shadow-[var(--shadow-lg)] hover:border-accent-gold/60 hover:shadow-[var(--shadow-xl)] hover:scale-105 hover:y-[-8px]"
                    : "bg-white border-accent-gold/20 shadow-[var(--shadow-md)] hover:border-accent-gold/40 hover:shadow-[var(--shadow-lg)] hover:scale-102 hover:y-[-4px]"}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: item.featured ? -8 : -4 }}
              >
                <motion.div
                  className={`w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center mb-5 transition-all duration-300
                  ${item.featured ? "bg-accent-gold/20 group-hover:bg-accent-gold/30" : "bg-accent-gold/10 group-hover:bg-accent-gold/15"}`}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                >
                  <Icon
                    size={24}
                    className={`transition-transform duration-300
                      ${item.featured ? "text-accent-gold-light group-hover:scale-125" : "text-accent-gold group-hover:scale-125"}`}
                  />
                </motion.div>
                <h3
                  className={`font-heading text-xl md:text-2xl tracking-wide mb-3 transition-colors duration-300
                  ${item.featured ? "text-white group-hover:text-accent-gold-light" : "text-accent-dark group-hover:text-accent-gold"}`}
                >
                  {item.title.toUpperCase()}
                </h3>
                <p
                  className={`text-sm leading-relaxed mb-4
                  ${item.featured ? "text-white/70 group-hover:text-white/90" : "text-text-secondary group-hover:text-text-primary transition-colors duration-300"}`}
                >
                  {item.description}
                </p>

                {/* Decorative accent line - appears on hover */}
                <motion.div
                  className={`h-1 rounded-full
                    ${item.featured ? "bg-accent-gold-light" : "bg-accent-gold"}`}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ originX: 0 }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
