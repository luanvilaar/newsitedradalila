"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

const stats = [
  { value: "+5", label: "Anos de experiência" },
  { value: "2", label: "Cidades de atendimento" },
  { value: "100%", label: "Foco no resultado" },
];

const specialties = ["Emagrecimento", "Saúde", "Performance"];

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-[#FAFAF7] to-[#F5F0EB]">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.022] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #8B7355 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Decorative bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent z-20" />

      {/* Full-height layout grid */}
      <div className="relative z-10 min-h-screen grid md:grid-cols-[55%_45%]">

        {/* ── Left: Text Content ── */}
        <div className="flex flex-col justify-center px-8 md:px-14 lg:px-20 xl:px-28 py-28 md:py-0 text-center md:text-left">

          {/* Gold accent rule */}
          <motion.div
            className="hidden md:block w-10 h-px bg-accent-gold mb-7 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />

          {/* Credential row */}
          <motion.div
            className="flex items-center gap-3 mb-4 justify-center md:justify-start"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <p className="font-body text-[0.6rem] tracking-[0.35em] uppercase text-accent-gold">
              Dra. Dalila Lucena
            </p>
            <div className="w-px h-3 bg-accent-gold/40" />
            <p className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-text-muted">
              CRM 15295
            </p>
          </motion.div>

          {/* Lead phrase — small eyebrow above h1 */}
          <motion.p
            className="font-body text-[0.7rem] tracking-[0.22em] uppercase text-text-muted mb-3 justify-center md:justify-start flex"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Medicina focada em
          </motion.p>

          {/* H1 — exactly 2 lines */}
          <motion.h1
            className="font-heading text-[2.65rem] md:text-[3rem] lg:text-[3.5rem] text-accent-dark leading-[1.12] tracking-tight mb-5"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.38 }}
          >
            Emagrecimento,<br />
            Saúde e Performance
          </motion.h1>

          {/* Specialty chips */}
          <motion.div
            className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.52 }}
          >
            {specialties.map((s) => (
              <span
                key={s}
                className="font-body text-[0.6rem] tracking-[0.18em] uppercase text-accent-gold/80 border border-accent-gold/25 rounded-full px-3 py-1 bg-accent-gold/5"
              >
                {s}
              </span>
            ))}
          </motion.div>

          {/* Gold divider */}
          <motion.div
            className="w-8 h-px bg-accent-gold/60 mx-auto md:mx-0 mb-5"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.58 }}
          />

          {/* Subtitle */}
          <motion.p
            className="font-body text-base md:text-[1.05rem] text-text-secondary leading-relaxed max-w-[420px] mx-auto md:mx-0 mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.63 }}
          >
            Tratamento personalizado e baseado em ciência para você alcançar
            sua melhor versão com saúde e qualidade de vida.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center md:items-start gap-3 mb-14"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.76 }}
          >
            <Link
              href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ304GQnQvezrYe8wYoeIY3Z9jumbUKc7oHPExOJWnWI2pt3lNbq80np2s8J7fydjXTDGCpuRxo1?gv=true"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="premium"
                size="lg"
                className="min-w-[196px]"
              >
                Agendar Consulta
              </Button>
            </Link>
            <Link href="/login" className="group">
              <Button
                variant="outline"
                size="lg"
                className="min-w-[196px] border-accent-dark/20 text-accent-dark group-hover:border-accent-gold group-hover:text-accent-gold transition-all duration-300"
              >
                Área do Paciente
              </Button>
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            className="hidden md:flex items-start pt-8 border-t border-border/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.95 }}
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-stretch">
                {i > 0 && (
                  <div className="w-px bg-border/60 mx-8 self-stretch" />
                )}
                <div>
                  <p className="font-heading text-[1.75rem] text-accent-gold leading-none">
                    {stat.value}
                  </p>
                  <p className="font-body text-[0.6rem] tracking-[0.15em] uppercase text-text-muted mt-1.5">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right: Photo full-height ── */}
        <motion.div
          className="hidden md:block relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.15 }}
        >
          {/* Left gradient blends photo into background */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FAFAF7] to-transparent z-10 pointer-events-none" />

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-[#F5F0EB] to-transparent z-10 pointer-events-none" />

          <Image
            src="/hero-dalila.png"
            alt="Dra. Dalila Lucena — Medicina de Performance e Longevidade"
            fill
            className="object-cover object-top"
            sizes="45vw"
            priority
          />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-9 border border-accent-dark/20 rounded-full flex items-start justify-center p-1">
          <motion.div
            className="w-1 h-2.5 bg-accent-dark/25 rounded-full"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
