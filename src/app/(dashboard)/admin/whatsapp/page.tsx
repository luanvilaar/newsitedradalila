"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageCircle, Send, Phone, Wifi, WifiOff, RefreshCw } from "lucide-react";

type Conversation = {
  wa_phone: string;
  memory_summary: string | null;
  updated_at: string;
  last_message: string;
  last_message_role: "user" | "assistant" | null;
  last_message_at: string;
};

type ChatMessage = {
  id: string;
  wa_phone: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type InstanceStatus = {
  connected: boolean;
  jid?: string | null;
  events?: string | null;
  error?: string;
};

const POLL_INTERVAL = 5000; // 5 seconds

export default function AdminWhatsAppPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [instanceStatus, setInstanceStatus] = useState<InstanceStatus | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.wa_phone === selectedPhone) || null,
    [conversations, selectedPhone]
  );

  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setLoadingConversations(true);
    try {
      const res = await fetch("/api/admin/whatsapp");
      if (!res.ok) throw new Error("Falha ao buscar conversas");

      const data = (await res.json()) as { conversations?: Conversation[] };
      const nextConversations = data.conversations || [];
      setConversations(nextConversations);

      if (!selectedPhone && nextConversations.length > 0) {
        setSelectedPhone(nextConversations[0].wa_phone);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }, [selectedPhone]);

  const loadMessages = useCallback(async (phone: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/whatsapp/${encodeURIComponent(phone)}`);
      if (!res.ok) throw new Error("Falha ao buscar mensagens");

      const data = (await res.json()) as { messages?: ChatMessage[] };
      setMessages(data.messages || []);
    } catch (error) {
      console.error(error);
      if (!silent) setMessages([]);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  async function loadInstanceStatus() {
    try {
      const res = await fetch("/api/admin/whatsapp/status");
      if (!res.ok) throw new Error("Status fetch failed");
      const data = (await res.json()) as InstanceStatus;
      setInstanceStatus(data);
    } catch {
      setInstanceStatus({ connected: false, error: "Falha ao verificar status" });
    }
  }

  async function handleSend() {
    if (!selectedPhone || !draft.trim() || sending) return;

    setSending(true);
    setSendStatus(null);
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wa_phone: selectedPhone, content: draft.trim() }),
      });

      const result = (await res.json()) as {
        success?: boolean;
        provider?: { ok?: boolean; status?: number; error?: string };
      };

      if (!res.ok) throw new Error("Falha ao enviar mensagem");

      setDraft("");

      if (result.provider?.ok) {
        setSendStatus({ ok: true, text: "Enviada via WhatsApp" });
      } else {
        setSendStatus({
          ok: false,
          text: `Salva localmente (Avisa: ${result.provider?.error || "erro"})`,
        });
      }

      await Promise.all([loadConversations(true), loadMessages(selectedPhone, true)]);
    } catch (error) {
      console.error(error);
      setSendStatus({ ok: false, text: "Erro ao enviar" });
    } finally {
      setSending(false);
      setTimeout(() => setSendStatus(null), 4000);
    }
  }

  // Scroll down on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial load
  useEffect(() => {
    loadConversations();
    loadInstanceStatus();
  }, [loadConversations]);

  // Polling for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations(true);
      if (selectedPhone) {
        loadMessages(selectedPhone, true);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedPhone, loadConversations, loadMessages]);

  useEffect(() => {
    if (!selectedPhone) return;
    loadMessages(selectedPhone);
  }, [selectedPhone]);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
            WHATSAPP WEB
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Central de conversas da recepção com pacientes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadInstanceStatus}
            className="text-text-muted hover:text-text-primary transition-colors"
            title="Atualizar status"
          >
            <RefreshCw size={14} />
          </button>
          {instanceStatus ? (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                instanceStatus.connected
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {instanceStatus.connected ? (
                <Wifi size={12} />
              ) : (
                <WifiOff size={12} />
              )}
              {instanceStatus.connected ? "Conectado" : "Desconectado"}
              {instanceStatus.jid && (
                <span className="text-[10px] opacity-70">
                  ({instanceStatus.jid.split("@")[0]})
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-gray-50 border border-gray-200 text-gray-500">
              Verificando...
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 h-[calc(100vh-220px)]">
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border-light bg-surface/60">
            <p className="text-sm font-medium text-text-primary">Conversas</p>
          </div>

          <div className="overflow-y-auto h-full">
            {loadingConversations ? (
              <div className="p-4 text-sm text-text-muted">Carregando...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-sm text-text-muted">
                Nenhuma conversa encontrada.
              </div>
            ) : (
              conversations.map((conversation) => {
                const active = selectedPhone === conversation.wa_phone;
                return (
                  <button
                    key={conversation.wa_phone}
                    onClick={() => setSelectedPhone(conversation.wa_phone)}
                    className={`w-full text-left px-4 py-3 border-b border-border-light transition-colors ${
                      active
                        ? "bg-accent-gold/10"
                        : "hover:bg-surface/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {conversation.wa_phone}
                      </p>
                      <span className="text-[11px] text-text-muted whitespace-nowrap">
                        {new Date(conversation.last_message_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {conversation.last_message || "Sem mensagens"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border-light bg-surface/60 flex items-center justify-between">
            {selectedConversation ? (
              <div>
                <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <Phone size={14} className="text-text-muted" />
                  {selectedConversation.wa_phone}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {selectedConversation.memory_summary || "Sem resumo de memória"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-muted">Selecione uma conversa</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-[#F8F9FA] space-y-3">
            {!selectedPhone ? (
              <div className="h-full flex items-center justify-center text-text-muted text-sm">
                <div className="text-center">
                  <MessageCircle className="mx-auto mb-2" size={20} />
                  Selecione uma conversa para visualizar as mensagens.
                </div>
              </div>
            ) : loadingMessages ? (
              <p className="text-sm text-text-muted">Carregando mensagens...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-text-muted">Sem mensagens nessa conversa.</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "assistant" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "assistant"
                        ? "bg-accent-dark text-white"
                        : "bg-white border border-border-light text-text-primary"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        message.role === "assistant" ? "text-white/70" : "text-text-muted"
                      }`}
                    >
                      {new Date(message.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {sendStatus && (
            <div
              className={`px-4 py-1.5 text-xs border-t ${
                sendStatus.ok
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {sendStatus.text}
            </div>
          )}

          <div className="p-3 border-t border-border-light bg-white flex gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={selectedPhone ? "Digite uma resposta..." : "Selecione uma conversa"}
              disabled={!selectedPhone || sending}
              className="flex-1 rounded-full border border-border-light px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-gold/30"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={!selectedPhone || !draft.trim() || sending}
              variant="premium"
              size="sm"
              className="rounded-full"
            >
              <Send size={16} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
