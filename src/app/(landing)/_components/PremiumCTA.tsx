"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function PremiumCTA() {
  return (
    <section className="relative py-20 md:py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-accent-dark">
        {/* Subtle gold gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-accent-gold/5 to-transparent" />

        {/* Decorative circles */}
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full border border-accent-gold/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full border border-white/5"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.p
          className="font-elegant text-accent-gold-light text-lg mb-4 tracking-wider italic"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Sua transformação começa aqui
        </motion.p>

        <motion.h2
          className="font-heading text-3xl md:text-6xl text-white tracking-wider leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          A CIÊNCIA A SERVIÇO DA
          <br />
          SUA MELHOR VERSÃO
        </motion.h2>

        <motion.p
          className="text-white/60 text-base md:text-lg mb-8 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Agende sua consulta e descubra como protocolos personalizados baseados
          em ciência podem transformar sua saúde e performance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative inline-block"
        >
          {/* Glow effect on hover */}
          <motion.div
            className="absolute -inset-3 bg-gradient-to-r from-accent-gold/0 via-accent-gold/30 to-accent-gold/0 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ opacity: 1 }}
          />

          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="group relative"
          >
            <Link
              href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ304GQnQvezrYe8wYoeIY3Z9jumbUKc7oHPExOJWnWI2pt3lNbq80np2s8J7fydjXTDGCpuRxo1?gv=true"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="premium" size="lg" className="min-w-[260px] text-lg relative z-10">
                Agendar Consulta
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
