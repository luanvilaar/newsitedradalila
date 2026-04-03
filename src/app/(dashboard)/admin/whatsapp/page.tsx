"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  MessageCircle,
  Send,
  Phone,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
  QrCode,
  Power,
} from "lucide-react";

// --- Types ---

type InstanceStatus = {
  instance?: {
    status: "disconnected" | "connecting" | "connected";
    qrcode: string;
    name: string;
    profileName: string;
    profilePicUrl: string;
    isBusiness: boolean;
    owner: string;
  };
  status?: {
    connected: boolean;
    loggedIn: boolean;
  };
};

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

// --- Connection Panel ---

function ConnectionPanel() {
  const [instanceStatus, setInstanceStatus] = useState<InstanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      if (res.ok) {
        const data = (await res.json()) as InstanceStatus;
        setInstanceStatus(data);
      }
    } catch (error) {
      console.error("Erro ao buscar status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchStatus]);

  const isConnected = instanceStatus?.status?.connected === true;
  const isConnecting = instanceStatus?.instance?.status === "connecting";
  const qrCode = instanceStatus?.instance?.qrcode || "";
  const profileName = instanceStatus?.instance?.profileName || instanceStatus?.instance?.name || "";
  const owner = instanceStatus?.instance?.owner || "";

  async function handleConnect() {
    setConnecting(true);
    try {
      const res = await fetch("/api/whatsapp/connect", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as InstanceStatus;
        setInstanceStatus(data);
      }
    } catch (error) {
      console.error("Erro ao conectar:", error);
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await fetch("/api/whatsapp/disconnect", { method: "POST" });
      await fetchStatus();
    } catch (error) {
      console.error("Erro ao desconectar:", error);
    } finally {
      setDisconnecting(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-text-muted">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Verificando conexão do WhatsApp...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi size={18} />
              <span className="text-sm font-medium">Conectado</span>
            </div>
          ) : isConnecting ? (
            <div className="flex items-center gap-2 text-amber-500">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-medium">Conectando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-500">
              <WifiOff size={18} />
              <span className="text-sm font-medium">Desconectado</span>
            </div>
          )}

          {isConnected && profileName && (
            <span className="text-xs text-text-muted border-l border-border-light pl-3 ml-1">
              {profileName} {owner ? `(${owner})` : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchStatus}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <RefreshCw size={14} />
            Atualizar
          </Button>

          {isConnected ? (
            <Button
              onClick={handleDisconnect}
              disabled={disconnecting}
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
            >
              {disconnecting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Power size={14} />
              )}
              Desconectar
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={connecting || isConnecting}
              variant="premium"
              size="sm"
              className="gap-1.5"
            >
              {connecting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <QrCode size={14} />
              )}
              Conectar
            </Button>
          )}
        </div>
      </div>

      {/* QR Code */}
      {!isConnected && qrCode && qrCode.startsWith("data:image") && (
        <div className="border border-border-light rounded-xl p-6 bg-white flex flex-col items-center gap-4">
          <p className="text-sm text-text-secondary text-center">
            Escaneie o QR Code abaixo com seu WhatsApp para conectar
          </p>
          <img
            src={qrCode}
            alt="QR Code WhatsApp"
            className="w-64 h-64 rounded-lg"
          />
          <p className="text-xs text-text-muted text-center">
            Abra o WhatsApp &gt; Menu &gt; Aparelhos conectados &gt; Conectar aparelho
          </p>
        </div>
      )}
    </Card>
  );
}

// --- Main Page ---

export default function AdminWhatsAppPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.wa_phone === selectedPhone) || null,
    [conversations, selectedPhone]
  );

  async function loadConversations() {
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
      setLoadingConversations(false);
    }
  }

  async function loadMessages(phone: string) {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/whatsapp/${encodeURIComponent(phone)}`);
      if (!res.ok) throw new Error("Falha ao buscar mensagens");

      const data = (await res.json()) as { messages?: ChatMessage[] };
      setMessages(data.messages || []);
    } catch (error) {
      console.error(error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSend() {
    if (!selectedPhone || !draft.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wa_phone: selectedPhone, content: draft.trim() }),
      });

      if (!res.ok) throw new Error("Falha ao enviar mensagem");

      setDraft("");
      await Promise.all([loadConversations(), loadMessages(selectedPhone)]);
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedPhone) return;
    loadMessages(selectedPhone);
  }, [selectedPhone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
          WHATSAPP
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Gerencie a conexão e as conversas do WhatsApp.
        </p>
      </div>

      {/* Connection Panel */}
      <div className="mb-6">
        <ConnectionPanel />
      </div>

      {/* Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 h-[calc(100vh-340px)]">
        {/* Sidebar - Conversation List */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border-light bg-surface/60">
            <p className="text-sm font-medium text-text-primary">Conversas</p>
          </div>

          <div className="overflow-y-auto h-full">
            {loadingConversations ? (
              <div className="p-4 text-sm text-text-muted flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Carregando...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-sm text-text-muted text-center">
                <MessageCircle className="mx-auto mb-2 opacity-40" size={24} />
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
                      active ? "bg-accent-gold/10" : "hover:bg-surface/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {conversation.wa_phone}
                      </p>
                      <span className="text-[11px] text-text-muted whitespace-nowrap">
                        {new Date(conversation.last_message_at).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
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

        {/* Chat Area */}
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
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Loader2 size={14} className="animate-spin" />
                Carregando mensagens...
              </div>
            ) : messages.length === 0 ? (
              <p className="text-sm text-text-muted">Sem mensagens nessa conversa.</p>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "assistant" ? "justify-end" : "justify-start"
                    }`}
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
                          message.role === "assistant"
                            ? "text-white/70"
                            : "text-text-muted"
                        }`}
                      >
                        {new Date(message.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="p-3 border-t border-border-light bg-white flex gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                selectedPhone ? "Digite uma resposta..." : "Selecione uma conversa"
              }
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
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
