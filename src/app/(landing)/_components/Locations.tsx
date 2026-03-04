"use client";

import { motion } from "framer-motion";
import { Instagram, Map, MapPin, Phone } from "lucide-react";

type LocationCard = {
  city: string;
  state: string;
  description: string;
  address?: string;
  mapsUrl?: string;
  wazeUrl?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
};

const locations: LocationCard[] = [
  {
    city: "João Pessoa",
    state: "PB",
    address:
      "R. Silvino Chaves, 911 - Manaíra, João Pessoa - PB, 58038-420",
    description:
      "Atendimento presencial com toda a infraestrutura para avaliação completa e acompanhamento personalizado.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=R.%20Silvino%20Chaves%2C%20911%20-%20Mana%C3%ADra%2C%20Jo%C3%A3o%20Pessoa%20-%20PB%2C%2058038-420",
    wazeUrl:
      "https://waze.com/ul?q=R.%20Silvino%20Chaves%2C%20911%20-%20Mana%C3%ADra%2C%20Jo%C3%A3o%20Pessoa%20-%20PB%2C%2058038-420&navigate=yes",
    whatsappNumber: "5583988118436",
    whatsappMessage: "Ol%C3%A1! Gostaria de agendar uma consulta em Jo%C3%A3o Pessoa.",
  },
  {
    city: "Recife",
    state: "PE",
    address:
      "Av. Mal. Mascarenhas de Morais, 4861 - Imbiribeira, Recife - PE, 51150-000",
    description:
      "Consultas presenciais com a mesma excelência e abordagem individualizada.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Av.%20Mal.%20Mascarenhas%20de%20Morais%2C%204861%20-%20Imbiribeira%2C%20Recife%20-%20PE%2C%2051150-000",
    wazeUrl:
      "https://waze.com/ul?q=Av.%20Mal.%20Mascarenhas%20de%20Morais%2C%204861%20-%20Imbiribeira%2C%20Recife%20-%20PE%2C%2051150-000&navigate=yes",
    instagramUrl: "https://www.instagram.com/sutilleclinica/",
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

                <p className="text-text-secondary text-sm leading-relaxed mb-4 group-hover:text-text-primary transition-colors duration-300">
                  {location.description}
                </p>

                {location.address ? (
                  <p className="text-text-primary text-sm md:text-base font-medium mb-6">
                    {location.address}
                  </p>
                ) : (
                  <div className="mb-6" />
                )}

                {/* Decorative line - appears on hover */}
                <motion.div
                  className="h-1 bg-gradient-to-r from-accent-gold to-transparent rounded-full mb-4"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ originX: 0 }}
                />

                <div className="flex flex-wrap items-center gap-3">
                  {location.mapsUrl && (
                    <a
                      href={location.mapsUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-accent-gold/40 bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 hover:border-accent-gold/60 transition-colors"
                      aria-label={`Abrir ${location.city} no Google Maps`}
                    >
                      <Map size={14} />
                      <span>Google Maps</span>
                    </a>
                  )}

                  {location.wazeUrl && (
                    <a
                      href={location.wazeUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-accent-gold/40 text-accent-gold hover:text-accent-gold-dark hover:border-accent-gold/60 transition-colors"
                      aria-label={`Abrir ${location.city} no Waze`}
                    >
                      <MapPin size={14} />
                      <span>Waze</span>
                    </a>
                  )}

                  {location.instagramUrl && (
                    <a
                      href={location.instagramUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-accent-gold/40 text-accent-gold hover:text-accent-gold-dark hover:border-accent-gold/60 transition-colors"
                      aria-label={`Abrir Instagram da clínica em ${location.city}`}
                    >
                      <Instagram size={14} />
                      <span>Instagram</span>
                    </a>
                  )}

                  {location.whatsappNumber ? (
                    <motion.a
                      href={`https://wa.me/${location.whatsappNumber}${location.whatsappMessage ? `?text=${location.whatsappMessage}` : ""}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-2 text-sm text-accent-gold group-hover:text-accent-gold-dark transition-colors cursor-pointer"
                      whileHover={{ x: 4 }}
                      aria-label={`Abrir WhatsApp para agendar consulta em ${location.city}`}
                    >
                      <Phone size={14} />
                      <span>Agendar consulta</span>
                    </motion.a>
                  ) : (
                    <motion.div
                      className="flex items-center gap-2 text-sm text-accent-gold group-hover:text-accent-gold-dark transition-colors cursor-pointer"
                      whileHover={{ x: 4 }}
                    >
                      <Phone size={14} />
                      <span>Agendar consulta</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
