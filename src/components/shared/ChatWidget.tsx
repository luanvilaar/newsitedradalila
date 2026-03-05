"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AgentMeta {
  intent: string;
  collect: {
    name: boolean;
    city: boolean;
    goal: boolean;
    period: boolean;
    whatsapp: boolean;
  };
  handoff: boolean;
}

const BOOKING_URL = process.env.NEXT_PUBLIC_CALENDAR_BOOKING_URL ?? null;

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Oi 😊 Eu sou a Claudia, recepção da Dra. Dalila Lucena.\nVocê quer agendar consulta 📅 ou tirar dúvidas sobre algum procedimento? 💬",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fecha booking ao fechar o widget
  useEffect(() => {
    if (!isOpen) setShowBooking(false);
  }, [isOpen]);

  const openBooking = useCallback(() => {
    if (BOOKING_URL) setShowBooking(true);
  }, []);

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageText.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            systemContext: {
              channel: "Website Chat",
              wa_phone: null,
              wa_profile_name: null,
              default_city_or_null: null,
              consulta_valor_or_null: "R$ 600,00",
              retorno_valor_or_null: null,
              bio_valor_or_null: null,
              slots_json_or_text: null,
              booking_url_or_null: BOOKING_URL,
              memory_summary_text_or_empty: "",
            },
          }),
        });

        const data = (await response.json()) as {
          message?: string;
          agentMeta?: AgentMeta;
          error?: string;
        };

        if (data.message) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.message,
          };
          setMessages((prev) => [...prev, assistantMessage]);

          // Abre o calendário inline quando Claudia detecta intenção de agendamento
          if (data.agentMeta?.intent === "schedule" && BOOKING_URL) {
            setTimeout(() => setShowBooking(true), 800);
          }
        } else if (data.error) {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (text: string) => {
    sendMessage(text);
  };

  return (
    <>
      {/* Botão flutuante */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-accent-gold to-accent-dark rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Fechar chat" : "Abrir assistente virtual"}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </motion.button>

      {/* Janela do chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-accent-gold/20 flex flex-col overflow-hidden transition-all duration-300 ${
              showBooking
                ? "h-[680px] max-h-[calc(100vh-100px)]"
                : "h-[520px] max-h-[calc(100vh-120px)]"
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-accent-dark to-accent-dark/90 text-white px-4 py-3 flex items-center gap-3 shrink-0">
              {showBooking ? (
                <>
                  <button
                    onClick={() => setShowBooking(false)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    aria-label="Voltar ao chat"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <div className="flex-1">
                    <p className="font-heading text-sm">Agendar Consulta</p>
                    <p className="text-xs text-white/70">
                      Escolha o melhor horário
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-heading text-sm">Claudia</p>
                    <p className="text-xs text-white/70">Dra. Dalila Lucena</p>
                  </div>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Minimizar chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </button>
            </div>

            {/* Modo agendamento — iframe do Google Calendar */}
            {showBooking && BOOKING_URL ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <iframe
                  src={BOOKING_URL}
                  style={{ border: 0 }}
                  width="100%"
                  className="flex-1"
                  frameBorder="0"
                  title="Agendamento online Dra. Dalila Lucena"
                />
              </div>
            ) : (
              <>
                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#FAFAF7] to-white">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          message.role === "user"
                            ? "bg-accent-dark text-white rounded-br-md"
                            : "bg-white border border-accent-gold/20 text-accent-dark rounded-bl-md shadow-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-accent-gold/20 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-accent-gold/60 rounded-full animate-bounce" />
                          <span
                            className="w-2 h-2 bg-accent-gold/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <span
                            className="w-2 h-2 bg-accent-gold/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick actions */}
                {messages.length <= 1 && (
                  <div className="px-4 py-2 bg-white border-t border-accent-gold/10">
                    {BOOKING_URL && (
                      <button
                        onClick={openBooking}
                        className="flex items-center justify-center gap-2 w-full mb-2 py-2 px-4 bg-gradient-to-r from-accent-gold to-accent-dark text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Agendar Consulta Online
                      </button>
                    )}
                    <p className="text-xs text-text-muted mb-2">
                      Perguntas frequentes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Quais tratamentos vocês oferecem?",
                        "Como agendar consulta?",
                        "Onde fica a clínica?",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleQuickAction(suggestion)}
                          className="text-xs bg-accent-gold/5 border border-accent-gold/20 text-accent-dark px-3 py-1.5 rounded-full hover:bg-accent-gold/10 transition-colors"
                          disabled={isLoading}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <form
                  onSubmit={handleSubmit}
                  className="p-3 bg-white border-t border-accent-gold/10 flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2.5 text-sm bg-[#FAFAF7] border border-accent-gold/20 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold/40 transition-all"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    variant="premium"
                    size="sm"
                    disabled={isLoading || !input.trim()}
                    className="rounded-full px-4"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
