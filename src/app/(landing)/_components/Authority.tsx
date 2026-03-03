"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Authority() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative aspect-[3/4] rounded-[var(--radius-xl)] overflow-hidden">
              <Image
                src="/about-dalila.png"
                alt="Dra. Dalila Lucena"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {/* CRM Badge */}
            <div className="absolute -bottom-4 -right-4 md:right-8 bg-accent-dark text-white px-6 py-3 rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)]">
              <p className="font-heading text-xl tracking-wider">CRM 15295</p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-elegant text-accent-gold text-lg mb-2 tracking-wider">
              Autoridade Médica
            </p>
            <h2 className="font-heading text-4xl md:text-5xl text-accent-dark tracking-wide mb-6">
              DRA. DALILA LUCENA
            </h2>
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

            {/* Credentials */}
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "Nutrologia",
                "Medicina Esportiva",
                "Performance",
                "Longevidade",
              ].map((credential) => (
                <span
                  key={credential}
                  className="px-4 py-2 bg-surface text-text-secondary text-sm rounded-[var(--radius-full)] border border-border-light"
                >
                  {credential}
                </span>
              ))}
            </div>

            {/* Credential Photos */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <motion.div
                className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Image
                  src="/congress-nutrologia-2022.png"
                  alt="Congresso Brasileiro de Nutrologia 2022 - ABRAN"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 40vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <p className="absolute bottom-2 left-3 right-3 text-white text-[10px] font-medium leading-tight">
                  Congresso Brasileiro de Nutrologia — ABRAN 2022
                </p>
              </motion.div>
              <motion.div
                className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Image
                  src="/sports-medicine-dalila.png"
                  alt="Dra. Dalila Lucena - Medicina do Esporte e Performance"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 40vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <p className="absolute bottom-2 left-3 right-3 text-white text-[10px] font-medium leading-tight">
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
