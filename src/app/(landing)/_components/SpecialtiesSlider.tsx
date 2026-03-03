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
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-8 items-center"
        >
          <div>
            <p className="font-elegant text-accent-gold text-lg mb-2 tracking-wider">
              Áreas de Atuação
            </p>
            <h2 className="font-heading text-4xl md:text-5xl text-accent-dark tracking-wide">
              ESPECIALIDADES
            </h2>
          </div>
          {/* Specializations photo - conference / academic context */}
          <motion.div
            className="relative h-48 md:h-56 rounded-[var(--radius-xl)] overflow-hidden hidden md:block"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Image
              src="/specializations-dalila.png"
              alt="Dra. Dalila Lucena em conferência médica"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 0vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface/80 to-transparent" />
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
                className="min-w-[300px] md:min-w-[340px] bg-white rounded-[var(--radius-xl)] p-8 border border-border-light
                  shadow-[var(--shadow-card)] group select-none"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -8,
                  boxShadow: "var(--shadow-hover)",
                  transition: { duration: 0.3 },
                }}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-accent-gold/10 flex items-center justify-center mb-5 group-hover:bg-accent-gold/20 transition-colors duration-300">
                  {Icon && (
                    <Icon
                      size={28}
                      className="text-accent-gold group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                </div>

                {/* Title */}
                <h3 className="font-heading text-2xl text-accent-dark tracking-wide mb-3">
                  {specialty.title.toUpperCase()}
                </h3>

                {/* Description */}
                <p className="text-text-secondary text-sm leading-relaxed">
                  {specialty.description}
                </p>

                {/* Decorative line */}
                <div className="mt-6 h-0.5 bg-accent-gold/20 group-hover:bg-accent-gold/40 transition-colors duration-300 rounded-full" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
