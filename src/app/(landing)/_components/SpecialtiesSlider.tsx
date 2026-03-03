"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { Scale, Zap, HeartPulse, Syringe } from "lucide-react";
import Image from "next/image";
import { SPECIALTIES } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Scale,
  Zap,
  HeartPulse,
  Syringe,
};

export function SpecialtiesSlider() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-24 bg-surface overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-elegant text-accent-gold text-lg mb-2 tracking-wider">
              Áreas de Atuação
            </p>
            <h2 className="font-heading text-4xl md:text-5xl text-accent-dark tracking-wide mb-6">
              ESPECIALIDADES
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-accent-gold via-accent-gold/50 to-transparent rounded-full" />
          </motion.div>

          {/* Specializations Image - Premium Design */}
          <motion.div
            className="relative h-64 md:h-80 rounded-[var(--radius-xl)] overflow-hidden group hidden md:block"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Decorative background glow */}
            <div className="absolute -inset-3 bg-gradient-to-br from-accent-gold/30 via-accent-dark/10 to-transparent rounded-[var(--radius-xl)] -z-10 blur-lg" />

            {/* Image with premium border */}
            <div className="relative w-full h-full border-2 border-accent-gold/50 rounded-[var(--radius-xl)] overflow-hidden shadow-[0_12px_32px_rgba(184,156,100,0.2)]">
              <Image
                src="/specializations-dalila.png"
                alt="Dra. Dalila Lucena em conferência médica sobre especialidades"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 0vw, 50vw"
              />

              {/* Premium overlay with blend modes */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent-dark/40 via-accent-dark/10 to-transparent mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-b from-accent-gold/10 to-transparent mix-blend-overlay pointer-events-none" />

              {/* Decorative corner accent */}
              <div className="absolute top-4 right-4 w-12 h-12 border-2 border-accent-gold/60 rounded-[var(--radius-lg)]" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Horizontal Slider */}
      <div className="relative">
        <motion.div
          ref={containerRef}
          className="flex gap-6 px-4 md:px-8 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={containerRef}
          style={{ paddingLeft: "max(1rem, calc((100vw - 72rem) / 2))" }}
        >
          {SPECIALTIES.map((specialty, index) => {
            const Icon = iconMap[specialty.icon];
            return (
              <motion.div
                key={specialty.id}
                className="min-w-[300px] md:min-w-[340px] bg-white rounded-[var(--radius-xl)] p-8
                  border border-accent-gold/20 shadow-[var(--shadow-card)] group select-none
                  hover:border-accent-gold/50 transition-colors duration-300"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -8,
                  boxShadow: "0 16px 40px rgba(184, 156, 100, 0.15)",
                  transition: { duration: 0.3 },
                }}
              >
                {/* Icon Container - Premium Design */}
                <motion.div
                  className="w-16 h-16 rounded-[var(--radius-lg)] bg-gradient-to-br from-accent-gold/15 to-accent-gold/5
                    flex items-center justify-center mb-6 border border-accent-gold/20
                    group-hover:from-accent-gold/25 group-hover:to-accent-gold/10 transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {Icon && (
                    <Icon
                      size={32}
                      className="text-accent-gold group-hover:scale-125 transition-transform duration-300"
                    />
                  )}
                </motion.div>

                {/* Title */}
                <h3 className="font-heading text-2xl text-accent-dark tracking-wide mb-3">
                  {specialty.title.toUpperCase()}
                </h3>

                {/* Description */}
                <p className="text-text-secondary text-sm leading-relaxed">
                  {specialty.description}
                </p>

                {/* Decorative accent line */}
                <motion.div
                  className="mt-6 h-1 bg-gradient-to-r from-accent-gold via-accent-gold/40 to-transparent rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ originX: 0 }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
