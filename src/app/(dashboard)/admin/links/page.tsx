"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import {
  Calendar,
  MessageSquare,
  ExternalLink,
  User,
  MapPin,
  Instagram,
  Phone,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  Globe,
  Loader2,
  AlertCircle
} from "lucide-react";

interface LinkTreeConfig {
  id?: string;
  title: string;
  subtitle: string;
  bio: string;
  avatar_url: string;
  instagram_url: string;
  whatsapp_url: string;
  video_url: string;
  video_redirect_url: string;
  show_video: boolean;
}

interface LinkTreeLink {
  id?: string;
  title: string;
  subtitle?: string;
  url: string;
  icon_name: string;
  is_primary: boolean;
  position_order: number;
  is_active: boolean;
}

const AVAILABLE_ICONS = [
  { name: "calendar", label: "Calendário", icon: <Calendar className="w-4 h-4" /> },
  { name: "message-square", label: "WhatsApp/Mensagem", icon: <MessageSquare className="w-4 h-4" /> },
  { name: "map-pin", label: "Localização/Mapa", icon: <MapPin className="w-4 h-4" /> },
  { name: "user", label: "Paciente/Login", icon: <User className="w-4 h-4" /> },
  { name: "instagram", label: "Instagram", icon: <Instagram className="w-4 h-4" /> },
  { name: "phone", label: "Telefone", icon: <Phone className="w-4 h-4" /> },
  { name: "external-link", label: "Site/Link Geral", icon: <ExternalLink className="w-4 h-4" /> },
];

export default function LinkTreeAdmin() {
  const [config, setConfig] = useState<LinkTreeConfig>({
    title: "",
    subtitle: "",
    bio: "",
    avatar_url: "",
    instagram_url: "",
    whatsapp_url: "",
    video_url: "",
    video_redirect_url: "",
    show_video: true
  });
  const [links, setLinks] = useState<LinkTreeLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingLink, setSavingLink] = useState(false);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

  // Controle do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkTreeLink | null>(null);
  const [linkForm, setLinkForm] = useState({
    title: "",
    subtitle: "",
    url: "",
    icon_name: "external-link",
    is_primary: false,
    is_active: true
  });

  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/links");
      if (!res.ok) throw new Error("Erro ao carregar dados");
      const data = await res.json();
      setConfig(data.config);
      setLinks(data.links);
    } catch (err) {
      console.error(err);
      showNotification("Erro ao carregar dados do Link Tree", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_config",
          config
        })
      });

      if (!res.ok) throw new Error("Erro ao salvar perfil");
      showNotification("Perfil do Link Tree atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      showNotification("Erro ao salvar alterações do perfil", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingLink(null);
    setLinkForm({
      title: "",
      subtitle: "",
      url: "",
      icon_name: "external-link",
      is_primary: false,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (link: LinkTreeLink) => {
    setEditingLink(link);
    setLinkForm({
      title: link.title,
      subtitle: link.subtitle || "",
      url: link.url,
      icon_name: link.icon_name,
      is_primary: link.is_primary,
      is_active: link.is_active
    });
    setIsModalOpen(true);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkForm.title || !linkForm.url) {
      showNotification("Título e URL são obrigatórios", "error");
      return;
    }

    try {
      setSavingLink(true);
      const payload = {
        action: "save_link",
        link: {
          ...linkForm,
          id: editingLink?.id,
          position_order: editingLink?.position_order ?? links.length
        }
      };

      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erro ao salvar link");

      showNotification(editingLink ? "Link atualizado com sucesso!" : "Novo link adicionado!");
      setIsModalOpen(false);
      fetchData(); // Recarrega
    } catch (err) {
      console.error(err);
      showNotification("Erro ao salvar link", "error");
    } finally {
      setSavingLink(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este link permanentemente?")) return;
    try {
      setDeletingLinkId(id);
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_link",
          id
        })
      });

      if (!res.ok) throw new Error("Erro ao excluir link");
      showNotification("Link removido com sucesso!");
      fetchData();
    } catch (err) {
      console.error(err);
      showNotification("Erro ao excluir link", "error");
    } finally {
      setDeletingLinkId(null);
    }
  };

  const handleMoveLink = async (index: number, direction: "up" | "down") => {
    const newLinks = [...links];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newLinks.length) return;

    // Swap local
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    // Atualiza position_order local
    const updatedOrder = newLinks.map((link, idx) => ({
      id: link.id!,
      position_order: idx
    }));

    // Seta estado local para visual instantâneo
    const tempState = newLinks.map((link, idx) => ({ ...link, position_order: idx }));
    setLinks(tempState);

    try {
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder_links",
          links: updatedOrder
        })
      });

      if (!res.ok) throw new Error("Erro ao reordenar");
    } catch (err) {
      console.error(err);
      showNotification("Erro ao salvar a nova ordem dos links", "error");
      fetchData(); // Reverte
    }
  };

  const getIconComponent = (name: string) => {
    switch (name) {
      case "calendar": return <Calendar className="w-5 h-5" />;
      case "message-square": return <MessageSquare className="w-5 h-5" />;
      case "map-pin": return <MapPin className="w-5 h-5" />;
      case "user": return <User className="w-5 h-5" />;
      case "instagram": return <Instagram className="w-5 h-5" />;
      case "phone": return <Phone className="w-5 h-5" />;
      default: return <ExternalLink className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-accent-gold" />
        <p className="text-text-secondary text-sm">Carregando painel do Link Tree...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-lg text-sm font-medium ${
              notification.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-error text-white"
            }`}
          >
            {notification.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
            GERENCIADOR DE LINK TREE
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Personalize a foto, biografias e links rápidos da bio do seu Instagram em tempo real.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open("/links", "_blank")}
          className="self-start sm:self-center border-accent-gold/40 text-accent-dark hover:border-accent-gold"
        >
          <Globe className="w-4 h-4 mr-2" />
          Ver Link Tree Público
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Formulário do Perfil */}
        <div className="lg:col-span-5">
          <Card>
            <h2 className="font-heading text-xl text-accent-dark tracking-wide mb-6">
              PERFIL & IDENTIDADE
            </h2>
            <form onSubmit={handleSaveConfig} className="space-y-5">
              <Input
                label="Foto de Perfil (URL)"
                id="avatar_url"
                value={config.avatar_url}
                onChange={(e) => setConfig({ ...config, avatar_url: e.target.value })}
                placeholder="/perfil-links.png"
                className="font-mono text-xs"
              />
              <div className="text-xs text-text-muted -mt-3 pl-1">
                Coloque o endereço de uma foto ou deixe <code className="bg-surface px-1.5 py-0.5 rounded font-mono">/perfil-links.png</code> para usar o padrão.
              </div>

              <Input
                label="Título Principal (Nome)"
                id="title"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Dra. Dalila Lucena"
                required
              />

              <Input
                label="Título Secundário (Especialidade)"
                id="subtitle"
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                placeholder="Medicina de Performance & Longevidade"
                required
              />

              <Textarea
                label="Biografia / Descrição Rápida"
                id="bio"
                value={config.bio}
                onChange={(e) => setConfig({ ...config, bio: e.target.value })}
                placeholder="Ciência, precisão e performance aplicadas..."
                rows={3}
              />

              <div className="border-t border-border-light pt-4 my-2">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Redes Sociais Rápidas</h3>
                <div className="space-y-4">
                  <Input
                    label="Link do Instagram"
                    id="instagram_url"
                    value={config.instagram_url}
                    onChange={(e) => setConfig({ ...config, instagram_url: e.target.value })}
                    placeholder="https://www.instagram.com/seuusuario"
                  />
                  <Input
                    label="Link do WhatsApp"
                    id="whatsapp_url"
                    value={config.whatsapp_url}
                    onChange={(e) => setConfig({ ...config, whatsapp_url: e.target.value })}
                    placeholder="https://wa.me/seunúmero"
                  />
                </div>
              </div>

              {/* Seção de Vídeo de Destaque */}
              <div className="border-t border-border-light pt-4 my-2 space-y-4">
                <h3 className="text-sm font-semibold text-text-primary">Vídeo de Destaque (Preview 10s)</h3>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.show_video}
                    onChange={(e) => setConfig({ ...config, show_video: e.target.checked })}
                    className="w-4 h-4 rounded text-accent-gold focus:ring-accent-gold border-border"
                  />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Exibir Vídeo de Destaque</p>
                    <p className="text-xs text-text-muted">Mostra um player de preview do Instagram no Link Tree.</p>
                  </div>
                </label>

                {config.show_video && (
                  <div className="space-y-4 pt-1">
                    <Input
                      label="URL Direta do Vídeo (MP4)"
                      id="video_url"
                      value={config.video_url}
                      onChange={(e) => setConfig({ ...config, video_url: e.target.value })}
                      placeholder="https://assets.mixkit.co/videos/preview/..."
                      className="font-mono text-xs"
                      required={config.show_video}
                    />
                    <Input
                      label="URL do Post (Redirecionamento no Instagram)"
                      id="video_redirect_url"
                      value={config.video_redirect_url}
                      onChange={(e) => setConfig({ ...config, video_redirect_url: e.target.value })}
                      placeholder="https://www.instagram.com/p/DYnJV9XJcQS/"
                      required={config.show_video}
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-4"
                disabled={savingConfig}
              >
                {savingConfig ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Salvando Perfil...
                  </>
                ) : (
                  "Salvar Perfil"
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Gerenciador de Links */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="font-heading text-xl text-accent-dark tracking-wide">
                LINKS DE ACESSO RÁPIDO
              </h2>
              <Button
                variant="premium"
                size="sm"
                onClick={handleOpenAddModal}
                className="shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Link
              </Button>
            </div>

            {links.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-surface/30">
                <Globe className="w-8 h-8 mx-auto text-text-muted mb-2" />
                <p className="text-text-primary font-medium text-sm">Nenhum botão de link cadastrado</p>
                <p className="text-text-muted text-xs mt-1 mb-4">Adicione links rápidos para direcionar seus pacientes.</p>
                <Button variant="outline" size="sm" onClick={handleOpenAddModal}>
                  Criar primeiro link
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link, index) => (
                  <motion.div
                    key={link.id}
                    layoutId={link.id}
                    className={`flex items-center justify-between p-4 rounded-xl border bg-white shadow-sm transition-all duration-300 ${
                      link.is_active ? "border-border hover:border-accent-gold/45" : "border-border/60 bg-gray-50/50 opacity-60"
                    }`}
                  >
                    {/* Detalhes & Ícone */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        link.is_primary ? "bg-accent-gold/15 text-accent-gold" : "bg-surface text-text-secondary"
                      }`}>
                        {getIconComponent(link.icon_name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-text-primary truncate">{link.title}</p>
                          {link.is_primary && (
                            <span className="text-[0.6rem] bg-accent-gold/10 text-accent-gold border border-accent-gold/25 px-1.5 py-0.5 rounded uppercase font-semibold">
                              Destaque
                            </span>
                          )}
                          {!link.is_active && (
                            <span className="text-[0.6rem] bg-gray-100 text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded uppercase font-semibold">
                              Inativo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted truncate mt-0.5">{link.subtitle || link.url}</p>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1.5 shrink-0 pl-3">
                      {/* Setas de Ordenação */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 w-8 h-8 rounded-full"
                        disabled={index === 0}
                        onClick={() => handleMoveLink(index, "up")}
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-4 h-4 text-text-muted" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 w-8 h-8 rounded-full"
                        disabled={index === links.length - 1}
                        onClick={() => handleMoveLink(index, "down")}
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-4 h-4 text-text-muted" />
                      </Button>

                      {/* Botão de Editar */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-1.5 w-8 h-8 rounded-full border-border hover:border-accent-gold/40 text-text-secondary hover:text-accent-gold"
                        onClick={() => handleOpenEditModal(link)}
                        title="Editar link"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>

                      {/* Botão de Excluir */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-1.5 w-8 h-8 rounded-full border-border hover:border-error/45 text-text-secondary hover:text-error"
                        disabled={deletingLinkId === link.id}
                        onClick={() => handleDeleteLink(link.id!)}
                        title="Remover link"
                      >
                        {deletingLinkId === link.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal para Adicionar / Editar Link */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLink ? "Editar Link de Acesso" : "Adicionar Novo Link"}
        size="lg"
      >
        <form onSubmit={handleSaveLink} className="space-y-4">
          <Input
            label="Título do Botão"
            id="modal_title"
            value={linkForm.title}
            onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
            placeholder="Ex: Agendar Consulta via Site"
            required
          />

          <Input
            label="Subtítulo/Descrição Rápida (Opcional)"
            id="modal_subtitle"
            value={linkForm.subtitle}
            onChange={(e) => setLinkForm({ ...linkForm, subtitle: e.target.value })}
            placeholder="Ex: Escolha o melhor horário online"
          />

          <Input
            label="Link de Destino (URL)"
            id="modal_url"
            value={linkForm.url}
            onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
            placeholder="Ex: /agendar ou https://wa.me/..."
            required
            className="font-mono text-sm"
          />

          {/* Seleção do Ícone */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-secondary">Ícone do Botão</span>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {AVAILABLE_ICONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setLinkForm({ ...linkForm, icon_name: item.name })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                    linkForm.icon_name === item.name
                      ? "border-accent-gold bg-accent-gold/10 text-accent-gold shadow-sm font-semibold"
                      : "border-border bg-white text-text-secondary hover:bg-surface"
                  }`}
                  title={item.label}
                >
                  {item.icon}
                  <span className="text-[0.6rem] mt-1 truncate max-w-full leading-none">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 border-t border-border-light pt-4 my-2">
            {/* Opção Primária/Destaque */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={linkForm.is_primary}
                onChange={(e) => setLinkForm({ ...linkForm, is_primary: e.target.checked })}
                className="w-4 h-4 rounded text-accent-gold focus:ring-accent-gold border-border"
              />
              <div>
                <p className="text-sm font-medium text-text-primary">Destacar botão (Destaque Dourado)</p>
                <p className="text-xs text-text-muted">Aplica preenchimento premium dourado e shimmer no botão.</p>
              </div>
            </label>

            {/* Ativo */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={linkForm.is_active}
                onChange={(e) => setLinkForm({ ...linkForm, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-accent-gold focus:ring-accent-gold border-border"
              />
              <div>
                <p className="text-sm font-medium text-text-primary">Link Ativo</p>
                <p className="text-xs text-text-muted">Desative temporariamente o link sem precisar excluí-lo.</p>
              </div>
            </label>
          </div>

          {/* Botões do Rodapé do Modal */}
          <div className="flex items-center justify-end gap-3 border-t border-border-light pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={savingLink}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={savingLink}
            >
              {savingLink ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Salvando Link...
                </>
              ) : (
                "Salvar Link"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
