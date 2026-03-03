"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Subtle warm background accents */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Warm gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#FAFAF7] to-[#F5F0EB]" />

        {/* Subtle gold radial accent - top right */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(201, 169, 110, 0.15) 0%, transparent 70%)",
          }}
        />

        {/* Subtle warm accent - bottom left */}
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(245, 240, 235, 0.8) 0%, transparent 70%)",
          }}
        />

        {/* Decorative gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid md:grid-cols-2 items-center gap-8 md:gap-12 py-24 md:py-0">
        {/* Left: Text Content */}
        <div className="text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-elegant text-xl md:text-2xl text-accent-gold mb-4 tracking-wider">
              Dra. Dalila Lucena — CRM 15295
            </p>
          </motion.div>

          <motion.h1
            className="font-heading text-4xl md:text-6xl lg:text-7xl text-accent-dark leading-none tracking-wider mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            CIÊNCIA, PRECISÃO E<br />
            PERFORMANCE
          </motion.h1>

          <motion.p
            className="font-elegant text-lg md:text-xl text-text-secondary mb-10 max-w-2xl italic"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Aplicadas à sua melhor versão.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center md:items-start gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button variant="premium" size="lg" className="min-w-[220px]">
              Agendar Consulta
            </Button>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="min-w-[220px] border-accent-dark/20 text-accent-dark hover:bg-accent-dark/5 hover:text-accent-dark"
              >
                Área do Paciente
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Right: Doctor Photo */}
        <motion.div
          className="relative hidden md:flex justify-center items-end"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="relative w-full max-w-md">
            {/* Photo - naturally blends with white background */}
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src="/hero-dalila.png"
                alt="Dra. Dalila Lucena — Medicina de Performance e Longevidade"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 0vw, 40vw"
                priority
              />
              {/* Bottom fade to white */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* Subtle gold accent behind photo */}
            <motion.div
              className="absolute -inset-8 -z-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 30%, rgba(201, 169, 110, 0.08) 0%, transparent 70%)",
              }}
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-accent-dark/20 rounded-full flex items-start justify-center p-1">
          <motion.div
            className="w-1.5 h-3 bg-accent-dark/30 rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
