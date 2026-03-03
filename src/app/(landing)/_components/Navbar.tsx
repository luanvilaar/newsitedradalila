"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[var(--shadow-card)] py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative">
          {/* Desktop: horizontal logo - shows on scroll (dark bg) */}
          <Image
            src="/logo-horizontal.png"
            alt="Dra. Dalila Lucena"
            width={180}
            height={50}
            className={cn(
              "transition-opacity duration-300 h-10 w-auto",
              scrolled ? "opacity-100" : "opacity-0 absolute"
            )}
            priority
          />
          {/* Transparent state: text fallback for logo */}
          <h1
            className={cn(
              "font-heading text-xl tracking-widest transition-all duration-300",
              scrolled ? "opacity-0 absolute" : "opacity-100 text-accent-dark"
            )}
          >
            DALILA LUCENA
          </h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: "#autoridade", label: "Sobre" },
            { href: "#especialidades", label: "Especialidades" },
            { href: "#metodo", label: "Método" },
            { href: "#locais", label: "Locais" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors duration-300 text-text-secondary hover:text-accent-gold"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/login"
            className={cn(
              "text-sm font-medium px-5 py-2 rounded-[var(--radius-full)] transition-all duration-300",
              scrolled
                ? "bg-accent-gold text-white hover:bg-accent-gold-dark"
                : "border border-accent-dark/20 text-accent-dark hover:bg-accent-dark/5"
            )}
          >
            Área do Paciente
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 cursor-pointer text-accent-dark"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-border-light"
          >
            <nav className="flex flex-col p-4 gap-1">
              {[
                { href: "#autoridade", label: "Sobre" },
                { href: "#especialidades", label: "Especialidades" },
                { href: "#metodo", label: "Método" },
                { href: "#locais", label: "Locais" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-text-secondary hover:text-accent-gold py-3 px-4 rounded-[var(--radius-md)] hover:bg-surface transition-colors text-sm font-medium"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 text-center bg-accent-gold text-white py-3 px-4 rounded-[var(--radius-md)] text-sm font-medium hover:bg-accent-gold-dark transition-colors"
              >
                Área do Paciente
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
