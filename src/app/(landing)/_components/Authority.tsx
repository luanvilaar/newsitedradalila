"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Authority() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start md:items-center">
          {/* Photo */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            {/* Decorative border/frame */}
            <div className="absolute -inset-1 md:-inset-3 bg-gradient-to-br from-accent-gold/40 via-accent-gold/10 to-transparent rounded-[var(--radius-xl)] -z-10 blur-md" />

            {/* Main image container with premium border */}
            <div className="relative aspect-[3/4] rounded-[var(--radius-xl)] overflow-hidden border-2 border-accent-gold/60 shadow-[0_8px_24px_rgba(184,156,100,0.15)]">
              <Image
                src="/about-dalila.png"
                alt="Dra. Dalila Lucena"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Elegant overlay with blend mode */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 via-transparent to-accent-dark/5 mix-blend-overlay pointer-events-none" />
            </div>

            {/* CRM Badge */}
            <motion.div
              className="absolute -bottom-4 -right-4 md:right-8 md:-bottom-6 bg-accent-dark text-white px-6 py-3 rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] border border-accent-gold/30"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-heading text-xl tracking-wider">CRM 15295</p>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <p className="font-elegant text-accent-gold text-lg mb-2 tracking-wider">
                Autoridade Médica
              </p>
              <h2 className="font-heading text-4xl md:text-5xl text-accent-dark tracking-wide">
                DRA. DALILA LUCENA
              </h2>
            </div>

            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                Médica especializada em ciência aplicada à performance e
                longevidade, com atuação nas áreas de{" "}
                <strong className="text-text-primary">Obesidade</strong>,{" "}
                <strong className="text-text-primary">
                  Performance Esportiva
                </strong>
                ,{" "}
                <strong className="text-text-primary">
                  Reposição Hormonal
                </strong>{" "}
                e{" "}
                <strong className="text-text-primary">
                  Implantes Hormonais
                </strong>
                .
              </p>
              <p>
                Com abordagem individualizada e respaldada por evidências
                científicas, desenvolve protocolos personalizados que integram
                exames de ponta, bioimpedância e acompanhamento estratégico para
                potencializar resultados com segurança.
              </p>
              <p>
                Atendimento presencial em{" "}
                <strong className="text-text-primary">João Pessoa</strong> e{" "}
                <strong className="text-text-primary">Recife</strong>.
              </p>
            </div>

            {/* Credentials Badges - Premium Design */}
            <div className="flex flex-wrap gap-3 pt-4">
              {[
                "Nutrologia",
                "Medicina Esportiva",
                "Performance",
                "Longevidade",
              ].map((credential, index) => (
                <motion.span
                  key={credential}
                  className="px-5 py-3 bg-gradient-to-br from-accent-gold/10 to-accent-dark/5 text-text-secondary text-sm font-medium rounded-[var(--radius-full)]
                    border border-accent-gold/40 shadow-[0_4px_12px_rgba(184,156,100,0.08)]
                    hover:border-accent-gold/70 hover:shadow-[0_8px_20px_rgba(184,156,100,0.15)]
                    hover:bg-accent-gold/15 transition-all duration-300 group"
                  whileHover={{ scale: 1.08, y: -2 }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <span className="relative z-10">{credential}</span>
                  {/* Subtle shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-[var(--radius-full)]" />
                </motion.span>
              ))}
            </div>

            {/* Credential Photos Grid - Premium Design */}
            <div className="mt-12 grid grid-cols-2 gap-6 pt-4">
              {/* Card 1: Congress */}
              <motion.div
                className="relative aspect-square rounded-[var(--radius-xl)] overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -6 }}
              >
                {/* Decorative glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-accent-gold/20 via-accent-dark/5 to-transparent -z-10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Image */}
                <Image
                  src="/congress-nutrologia-2022.png"
                  alt="Congresso Brasileiro de Nutrologia 2022 - ABRAN"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 40vw, 20vw"
                />

                {/* Dual overlays with blend modes */}
                <div className="absolute inset-0 bg-gradient-to-t from-accent-dark/75 via-accent-dark/25 to-transparent mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-accent-gold/12 to-transparent mix-blend-overlay pointer-events-none" />

                {/* Premium border */}
                <div className="absolute inset-0 border-2 border-accent-gold/40 rounded-[var(--radius-xl)] group-hover:border-accent-gold/70 transition-colors duration-300" />

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                  <p className="text-white text-sm font-semibold leading-tight drop-shadow-lg">
                    Congresso Brasileiro de Nutrologia
                  </p>
                  <p className="text-accent-gold text-xs mt-1 drop-shadow-lg">ABRAN 2022</p>
                </div>

                {/* Decorative badge */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-[var(--radius-md)] bg-accent-gold/20 border border-accent-gold/50 flex items-center justify-center backdrop-blur-sm group-hover:bg-accent-gold/30 transition-colors duration-300">
                  <span className="text-xs font-bold text-accent-gold">★</span>
                </div>
              </motion.div>

              {/* Card 2: Sports Medicine */}
              <motion.div
                className="relative aspect-square rounded-[var(--radius-xl)] overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.05, y: -6 }}
              >
                {/* Decorative glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-accent-gold/20 via-accent-dark/5 to-transparent -z-10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Image */}
                <Image
                  src="/sports-medicine-dalila.png"
                  alt="Dra. Dalila Lucena - Medicina do Esporte e Performance"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 40vw, 20vw"
                />

                {/* Dual overlays with blend modes */}
                <div className="absolute inset-0 bg-gradient-to-t from-accent-dark/70 via-accent-dark/15 to-transparent mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-accent-gold/15 to-transparent mix-blend-screen pointer-events-none" />

                {/* Premium border */}
                <div className="absolute inset-0 border-2 border-accent-gold/40 rounded-[var(--radius-xl)] group-hover:border-accent-gold/70 transition-colors duration-300" />

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                  <p className="text-white text-sm font-semibold leading-tight drop-shadow-lg">
                    Medicina do Esporte
                  </p>
                  <p className="text-accent-gold text-xs mt-1 drop-shadow-lg">e Performance</p>
                </div>

                {/* Decorative badge */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-[var(--radius-md)] bg-accent-gold/20 border border-accent-gold/50 flex items-center justify-center backdrop-blur-sm group-hover:bg-accent-gold/30 transition-colors duration-300">
                  <span className="text-xs font-bold text-accent-gold">⚡</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
