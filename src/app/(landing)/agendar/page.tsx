import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AgendarPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#FAFAF7] to-[#F5F0EB] text-accent-dark">
      <Navbar />

      <section className="relative z-10 px-6 md:px-10 lg:px-16 xl:px-24 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 mb-10">
            <p className="font-body text-[0.7rem] tracking-[0.22em] uppercase text-text-muted">Agenda</p>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] leading-tight">Agende sua consulta</h1>
            <p className="font-body text-base md:text-lg text-text-secondary max-w-3xl">
              Escolha o melhor horário para você. Caso precise de ajuda, entre em contato pelo WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm" className="border-accent-dark/20 text-accent-dark">
                <Link href="/">Voltar para a página inicial</Link>
              </Button>
              <Button asChild variant="premium" size="sm">
                <Link href="https://wa.me/5581999999999" target="_blank" rel="noreferrer">
                  Falar no WhatsApp
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative w-full bg-white/95 border border-accent-gold/25 rounded-3xl shadow-[0_24px_70px_-32px_rgba(56,46,32,0.25)] overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(139,115,85,0.08) 1px, transparent 1px)",
                backgroundSize: "26px 26px",
              }}
            />
            <div className="w-full aspect-[3/2] md:aspect-[16/9] lg:h-[78vh]">
              <iframe
                src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ304GQnQvezrYe8wYoeIY3Z9jumbUKc7oHPExOJWnWI2pt3lNbq80np2s8J7fydjXTDGCpuRxo1?gv=true"
                className="w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                title="Agendamento de consulta"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
