"use client";

import { motion } from "framer-motion";
import { Scale, Zap, HeartPulse, Syringe } from "lucide-react";
import Image from "next/image";
import { SPECIALTIES } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Scale,
  Zap,
  HeartPulse,
  Syringe,
};

// Premium Unsplash images — thematically curated for each specialty
const imageMap: Record<string, string> = {
  obesity:
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&h=400&q=80",
  performance:
    "/performance.png",
  "hormonal-replacement":
    "/reposicao-hormonal.png",
  "hormonal-implants":
    "/implante.png",
};

const imagePositionMap: Record<string, string> = {
  "hormonal-implants": "object-[50%_65%]",
};

export function SpecialtiesSlider() {
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

          {/* Specializations Image */}
          <motion.div
            className="relative h-64 md:h-80 rounded-[var(--radius-xl)] overflow-hidden group hidden md:block"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute -inset-3 bg-gradient-to-br from-accent-gold/30 via-accent-dark/10 to-transparent rounded-[var(--radius-xl)] -z-10 blur-lg" />
            <div className="relative w-full h-full border-2 border-accent-gold/50 rounded-[var(--radius-xl)] overflow-hidden shadow-[0_12px_32px_rgba(184,156,100,0.2)]">
              <Image
                src="/foto%20dog.png"
                alt="Dra. Dalila Lucena — Especialidades"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 0vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-accent-dark/40 via-accent-dark/10 to-transparent mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-b from-accent-gold/10 to-transparent mix-blend-overlay pointer-events-none" />
              <div className="absolute top-4 right-4 w-12 h-12 border-2 border-accent-gold/60 rounded-[var(--radius-lg)]" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Specialty Cards with images */}
      <div className="px-4 sm:px-6 lg:px-8 pt-2">
        <motion.div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
          {SPECIALTIES.map((specialty, index) => {
            const Icon = iconMap[specialty.icon];
            const imageSrc = imageMap[specialty.id];
            const imagePositionClass = imagePositionMap[specialty.id] ?? "object-center";
            return (
              <motion.div
                key={specialty.id}
                className="group relative h-[400px] w-full overflow-hidden rounded-[var(--radius-xl)] bg-surface shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Background Image with Zoom Effect */}
                <div className="absolute inset-0 h-full w-full">
                  <Image
                    src={imageSrc}
                    alt={specialty.title}
                    fill
                    className={`object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${imagePositionClass}`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-accent-dark/95 via-accent-dark/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
                </div>

                {/* Floating Icon Badge */}
                <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm transition-all duration-300 group-hover:bg-accent-gold group-hover:border-accent-gold">
                  {Icon && <Icon size={20} className="text-white transition-colors duration-300" />}
                </div>

                {/* Content Section */}
                <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                  <div className="mb-2 h-0.5 w-12 bg-accent-gold transition-all duration-500 group-hover:w-20" />
                  
                  <h3 className="mb-3 font-heading text-2xl font-semibold tracking-wide text-white">
                    {specialty.title}
                  </h3>
                  
                  <p className="line-clamp-3 text-sm font-light text-white/80 transition-colors duration-300 group-hover:text-white">
                    {specialty.description}
                  </p>
                  
                  {/* Interactive 'Learn More' Arrow (Visual cue) */}
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent-gold opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
                    Saiba mais
                    <div className="h-px w-8 bg-accent-gold" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
