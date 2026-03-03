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

            {/* Credentials Badges */}
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                "Nutrologia",
                "Medicina Esportiva",
                "Performance",
                "Longevidade",
              ].map((credential) => (
                <motion.span
                  key={credential}
                  className="px-4 py-2 bg-gradient-to-br from-accent-gold/5 to-accent-dark/5 text-text-secondary text-sm rounded-[var(--radius-full)] border border-accent-gold/30 hover:border-accent-gold/60 hover:bg-accent-gold/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  {credential}
                </motion.span>
              ))}
            </div>

            {/* Credential Photos Grid */}
            <div className="mt-10 grid grid-cols-2 gap-4 pt-4">
              <motion.div
                className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src="/congress-nutrologia-2022.png"
                  alt="Congresso Brasileiro de Nutrologia 2022 - ABRAN"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 40vw, 20vw"
                />

                {/* Overlay with brand colors - using multiply blend mode */}
                <div className="absolute inset-0 bg-gradient-to-t from-accent-dark/70 via-accent-dark/20 to-transparent mix-blend-multiply" />

                {/* Additional warm overlay for premium feel */}
                <div className="absolute inset-0 bg-gradient-to-b from-accent-gold/10 to-transparent mix-blend-overlay pointer-events-none" />

                {/* Border highlight */}
                <div className="absolute inset-0 border border-accent-gold/30 rounded-[var(--radius-lg)]" />

                <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium leading-tight drop-shadow-lg">
                  Congresso Brasileiro de Nutrologia — ABRAN 2022
                </p>
              </motion.div>

              <motion.div
                className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src="/sports-medicine-dalila.png"
                  alt="Dra. Dalila Lucena - Medicina do Esporte e Performance"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 40vw, 20vw"
                />

                {/* Overlay with brand colors - using screen blend mode for lighter effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-accent-dark/60 via-accent-dark/10 to-transparent mix-blend-multiply" />

                {/* Warm tone overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-accent-gold/15 to-transparent mix-blend-screen pointer-events-none" />

                {/* Border highlight */}
                <div className="absolute inset-0 border border-accent-gold/30 rounded-[var(--radius-lg)]" />

                <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium leading-tight drop-shadow-lg">
                  Medicina do Esporte e Performance
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
