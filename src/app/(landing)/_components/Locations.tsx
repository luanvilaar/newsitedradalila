"use client";

import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";

const locations = [
  {
    city: "João Pessoa",
    state: "PB",
    description:
      "Atendimento presencial com toda a infraestrutura para avaliação completa e acompanhamento personalizado.",
  },
  {
    city: "Recife",
    state: "PE",
    description:
      "Consultas presenciais com a mesma excelência e abordagem individualizada.",
  },
];

export function Locations() {
  return (
    <section className="py-24 px-4 bg-surface">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-elegant text-accent-gold text-lg mb-2 tracking-wider">
            Onde Atendemos
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-accent-dark tracking-wide">
            CIDADES DE ATENDIMENTO
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={location.city}
              className="relative bg-white rounded-[var(--radius-xl)] p-8 md:p-10 border border-accent-gold/20
                shadow-[var(--shadow-md)] overflow-hidden group transition-all duration-300 cursor-pointer
                hover:border-accent-gold/40 hover:shadow-[var(--shadow-lg)]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{
                y: -6,
                transition: { duration: 0.3 },
              }}
            >
              {/* Decorative map-like background */}
              <div className="absolute top-0 right-0 w-40 h-40 opacity-5">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="var(--accent-gold)"
                    strokeWidth="0.5"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="30"
                    fill="none"
                    stroke="var(--accent-gold)"
                    strokeWidth="0.5"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="15"
                    fill="none"
                    stroke="var(--accent-gold)"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="5"
                    y1="50"
                    x2="95"
                    y2="50"
                    stroke="var(--accent-gold)"
                    strokeWidth="0.3"
                  />
                  <line
                    x1="50"
                    y1="5"
                    x2="50"
                    y2="95"
                    stroke="var(--accent-gold)"
                    strokeWidth="0.3"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center group-hover:bg-accent-gold/20 transition-colors duration-300"
                    whileHover={{ scale: 1.15, rotate: 10 }}
                  >
                    <MapPin size={20} className="text-accent-gold group-hover:scale-125 transition-transform duration-300" />
                  </motion.div>
                  <div>
                    <h3 className="font-heading text-2xl text-accent-dark tracking-wide group-hover:text-accent-gold transition-colors duration-300">
                      {location.city.toUpperCase()}
                    </h3>
                    <p className="text-xs text-text-muted">{location.state}</p>
                  </div>
                </div>

                <p className="text-text-secondary text-sm leading-relaxed mb-6 group-hover:text-text-primary transition-colors duration-300">
                  {location.description}
                </p>

                {/* Decorative line - appears on hover */}
                <motion.div
                  className="h-1 bg-gradient-to-r from-accent-gold to-transparent rounded-full mb-4"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ originX: 0 }}
                />

                <motion.div
                  className="flex items-center gap-2 text-sm text-accent-gold group-hover:text-accent-gold-dark transition-colors cursor-pointer"
                  whileHover={{ x: 4 }}
                >
                  <Phone size={14} />
                  <span>Agendar consulta</span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
