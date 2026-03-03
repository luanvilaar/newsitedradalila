"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Abstract Scientific Background */}
      <div className="absolute inset-0">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />

        {/* Animated molecular/scientific particles */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating circles representing molecules */}
          <motion.div
            className="absolute w-96 h-96 rounded-full border border-white/5"
            style={{ top: "10%", left: "5%" }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full border border-accent-gold/10"
            style={{ top: "30%", right: "10%" }}
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [360, 180, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full border border-white/5"
            style={{ bottom: "20%", left: "20%" }}
            animate={{
              scale: [1, 1.2, 1],
              y: [0, -20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Molecular dots */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-accent-gold/20"
              style={{
                top: `${15 + i * 15}%`,
                left: `${10 + i * 14}%`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}

          {/* Connection lines (biomolecular structures) */}
          <svg
            className="absolute inset-0 w-full h-full opacity-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.line
              x1="10%"
              y1="20%"
              x2="30%"
              y2="40%"
              stroke="white"
              strokeWidth="1"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.line
              x1="30%"
              y1="40%"
              x2="50%"
              y2="25%"
              stroke="white"
              strokeWidth="1"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            />
            <motion.line
              x1="50%"
              y1="25%"
              x2="70%"
              y2="50%"
              stroke="white"
              strokeWidth="1"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 6, repeat: Infinity, delay: 2 }}
            />
            <motion.line
              x1="70%"
              y1="50%"
              x2="90%"
              y2="30%"
              stroke="white"
              strokeWidth="1"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}
            />
          </svg>

          {/* Helix-inspired double wave */}
          <svg
            className="absolute bottom-0 left-0 w-full h-40 opacity-5"
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0,80 C360,30 720,130 1080,80 C1260,55 1380,40 1440,80"
              fill="none"
              stroke="var(--accent-gold)"
              strokeWidth="2"
              animate={{ d: ["M0,80 C360,30 720,130 1080,80 C1260,55 1380,40 1440,80", "M0,80 C360,130 720,30 1080,80 C1260,105 1380,120 1440,80"] }}
              transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content - Split Layout */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid md:grid-cols-2 items-center gap-8 md:gap-12 py-24 md:py-0">
        {/* Left: Text Content */}
        <div className="text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-elegant text-xl md:text-2xl text-accent-gold-light mb-4 tracking-wider">
              Dra. Dalila Lucena — CRM 15295
            </p>
          </motion.div>

          <motion.h1
            className="font-heading text-4xl md:text-6xl lg:text-7xl text-white leading-none tracking-wider mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            CIÊNCIA, PRECISÃO E<br />
            PERFORMANCE
          </motion.h1>

          <motion.p
            className="font-elegant text-lg md:text-xl text-white/80 mb-10 max-w-2xl italic"
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
                className="min-w-[220px] border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Área do Paciente
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Right: Doctor Photo */}
        <motion.div
          className="relative hidden md:flex justify-center items-end"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="relative w-full max-w-md">
            {/* HALO 1: Rose Gold Primary "breathing" pulse */}
            <motion.div
              className="absolute -inset-16 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 40% 20%, rgba(201, 169, 110, 0.6) 0%, transparent 70%)",
                filter: "blur(40px)",
                zIndex: -2,
              }}
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />

            {/* HALO 2: Charcoal Blue depth anchor */}
            <motion.div
              className="absolute -inset-24 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 30%, rgba(31, 41, 55, 0.3) 0%, transparent 60%)",
                filter: "blur(60px)",
                zIndex: -1,
              }}
              animate={{
                opacity: [0.15, 0.3, 0.15],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 2.25,
              }}
            />

            {/* HALO 3: Medical Green accent (imperceptible) */}
            <motion.div
              className="absolute -inset-20 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 150% 80% at 50% 60%, rgba(123, 166, 140, 0.15) 0%, transparent 70%)",
                filter: "blur(80px)",
                zIndex: -1,
              }}
              animate={{
                opacity: [0.05, 0.12, 0.05],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 1,
              }}
            />

            {/* LIGHT ENHANCEMENT: Top ambient light */}
            <motion.div
              className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                width: "150%",
                height: "40%",
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.2) 0%, transparent 70%)",
                filter: "blur(80px)",
                mixBlendMode: "screen",
                zIndex: -3,
              }}
            />

            {/* LIGHT ENHANCEMENT: Edge glow (lateral rim light) */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 100% 100% at 0% 50%, rgba(201, 169, 110, 0.1) 0%, transparent 50%)",
                filter: "blur(40px)",
                mixBlendMode: "overlay",
                zIndex: -2,
              }}
            />

            {/* Photo container with gradient mask dissolution */}
            <div className="relative aspect-[3/4] overflow-hidden hero-photo hero-image-dissolved">
              <Image
                src="/hero-dalila.png"
                alt="Dra. Dalila Lucena — Medicina de Performance e Longevidade"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 0vw, 40vw"
                priority
              />
              {/* Bottom fade-to-transparent gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a1a2e] to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
          <motion.div
            className="w-1.5 h-3 bg-white/50 rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
