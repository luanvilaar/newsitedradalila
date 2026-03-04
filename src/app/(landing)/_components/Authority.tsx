"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Authority() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">

        {/* Centered section title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-elegant text-accent-gold text-lg tracking-wider mb-2">
            Autoridade Médica
          </p>
          <h2 className="font-heading text-5xl md:text-6xl text-accent-dark tracking-wide">
            DRA. DALILA LUCENA
          </h2>
          <div className="mt-4 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-accent-gold to-transparent" />
        </motion.div>

        {/* Editorial grid: 3-column mosaic + content */}
        <div className="grid lg:grid-cols-[4fr_3fr_5fr] gap-5 items-stretch min-h-[600px]">

          {/* Col 1: Main portrait — tall, face at top */}
          <motion.div
            className="relative rounded-[var(--radius-2xl)] overflow-hidden group shadow-[0_16px_48px_rgba(184,156,100,0.14)] border border-accent-gold/25"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85 }}
            whileHover={{ scale: 1.015 }}
          >
            <Image
              src="/foto-atleta.png"
              alt="Dra. Dalila Lucena"
              fill
              className="object-cover object-[50%_6%] group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 28vw"
              priority
            />
            {/* Warm gold tone overlay */}
            <div className="absolute inset-0 bg-[#b89c64]/10 mix-blend-multiply" />
            {/* Bottom gradient for CRM */}
            <div className="absolute inset-0 bg-gradient-to-t from-accent-dark/60 via-transparent to-transparent" />
            {/* Golden top edge accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent-gold to-transparent opacity-70" />

            <div className="absolute bottom-5 left-5">
              <span className="inline-block bg-accent-dark/80 backdrop-blur-sm text-accent-gold font-heading text-sm tracking-[0.2em] px-4 py-2 rounded-[var(--radius-md)] border border-accent-gold/40">
                CRM 15295
              </span>
            </div>
          </motion.div>

          {/* Col 2: Two stacked credential cards */}
          <div className="flex flex-col gap-5">
            {/* Congress card */}
            <motion.div
              className="relative flex-1 rounded-[var(--radius-2xl)] overflow-hidden group shadow-[var(--shadow-md)] border border-accent-gold/25 cursor-pointer"
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              whileHover={{ scale: 1.03, y: -4 }}
            >
              <Image
                src="/congress-nutrologia-2022.png"
                alt="Congresso Brasileiro de Nutrologia ABRAN 2022"
                fill
                className="object-cover object-[50%_55%] group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, 18vw"
              />
              {/* Purple/gold duotone effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-dark/10 to-accent-dark/80" />
              <div className="absolute inset-0 bg-[#b89c64]/18 mix-blend-multiply" />
              <div className="absolute inset-0 border border-accent-gold/30 rounded-[var(--radius-2xl)] group-hover:border-accent-gold/60 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-semibold leading-snug drop-shadow">
                  Congresso Brasileiro de Nutrologia
                </p>
                <p className="text-accent-gold text-xs mt-1 tracking-wide">ABRAN 2022</p>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 rounded-[var(--radius-md)] bg-accent-dark/50 border border-accent-gold/50 flex items-center justify-center backdrop-blur-sm">
                <span className="text-xs font-bold text-accent-gold">★</span>
              </div>
            </motion.div>

            {/* Sports medicine card */}
            <motion.div
              className="relative flex-1 rounded-[var(--radius-2xl)] overflow-hidden group shadow-[var(--shadow-md)] border border-accent-gold/25 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              whileHover={{ scale: 1.03, y: -4 }}
            >
              <Image
                src="/foto-musculacao.png"
                alt="Medicina do Esporte e Performance"
                fill
                className="object-cover object-[50%_20%] group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, 18vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-dark/10 to-accent-dark/80" />
              <div className="absolute inset-0 bg-[#b89c64]/18 mix-blend-multiply" />
              <div className="absolute inset-0 border border-accent-gold/30 rounded-[var(--radius-2xl)] group-hover:border-accent-gold/60 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-semibold leading-snug drop-shadow">
                  Medicina do Esporte
                </p>
                <p className="text-accent-gold text-xs mt-1 tracking-wide">e Performance</p>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 rounded-[var(--radius-md)] bg-accent-dark/50 border border-accent-gold/50 flex items-center justify-center backdrop-blur-sm">
                <span className="text-xs font-bold text-accent-gold">⚡</span>
              </div>
            </motion.div>
          </div>

          {/* Col 3: Text content */}
          <motion.div
            className="flex flex-col justify-center space-y-7 lg:pl-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, delay: 0.2 }}
          >
            <div className="space-y-4 text-text-secondary text-[15px] leading-relaxed">
              <p>
                Médica especializada em ciência aplicada à performance e longevidade,
                com atuação nas áreas de{" "}
                <strong className="text-text-primary">Obesidade</strong>,{" "}
                <strong className="text-text-primary">Performance Esportiva</strong>,{" "}
                <strong className="text-text-primary">Reposição Hormonal</strong>{" "}
                e <strong className="text-text-primary">Implantes Hormonais</strong>.
              </p>
              <p>
                Com abordagem individualizada e respaldada por evidências científicas,
                desenvolve protocolos personalizados que integram exames de ponta,
                bioimpedância e acompanhamento estratégico para potencializar
                resultados com segurança.
              </p>
              <p>
                Atendimento presencial em{" "}
                <strong className="text-text-primary">João Pessoa</strong> e{" "}
                <strong className="text-text-primary">Recife</strong>.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-accent-gold/50 via-accent-gold/20 to-transparent" />

            {/* Specialty badges — 2×2 grid */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted mb-4">
                Especialidades
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Nutrologia",
                  "Med. Esportiva",
                  "Performance",
                  "Longevidade",
                ].map((label, index) => (
                  <motion.div
                    key={label}
                    className="flex items-center gap-2.5 px-4 py-3 bg-surface rounded-[var(--radius-lg)]
                      border border-accent-gold/20 hover:border-accent-gold/55
                      hover:bg-accent-gold/5 transition-all duration-300"
                    whileHover={{ x: 3 }}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.07 }}
                  >
                    <span className="text-accent-gold text-[10px]">◆</span>
                    <span className="text-text-primary text-sm font-medium">{label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
