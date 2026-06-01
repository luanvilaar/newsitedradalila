"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Instagram,
  Phone,
  Calendar,
  MapPin,
  User,
  Share2,
  Check,
  MoreVertical,
  ExternalLink,
  MessageSquare,
  Play,
  RotateCcw,
  Volume2,
  VolumeX
} from "lucide-react";

interface LinkTreeConfig {
  title: string;
  subtitle: string;
  bio: string;
  avatar_url: string;
  instagram_url?: string;
  whatsapp_url?: string;
  video_url?: string;
  video_redirect_url?: string;
  show_video?: boolean;
}

interface LinkTreeLink {
  id?: string;
  title: string;
  subtitle?: string;
  url: string;
  icon_name: string;
  is_primary: boolean;
}

// Links estáticos de fallback em caso de falha de conexão com a API
const FALLBACK_LINKS: LinkTreeLink[] = [
  {
    title: "Agendar Consulta Online",
    subtitle: "Escolha o melhor horário via Google Calendar",
    url: "/agendar",
    icon_name: "calendar",
    is_primary: true,
  },
  {
    title: "Falar no WhatsApp (João Pessoa)",
    subtitle: "Atendimento presencial em Manaíra",
    url: "https://wa.me/5583988118436?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20em%20Jo%C3%A3o%20Pessoa.",
    icon_name: "message-square",
    is_primary: false,
  },
  {
    title: "Conhecer Nosso Site Principal",
    subtitle: "Nossos tratamentos, especialidades e método",
    url: "/",
    icon_name: "external-link",
    is_primary: false,
  },
  {
    title: "Área do Paciente",
    subtitle: "Acesse seus exames, receitas e prontuário",
    url: "/login",
    icon_name: "user",
    is_primary: false,
  },
  {
    title: "Consultório João Pessoa - PB",
    subtitle: "Rua Silvino Chaves, 911 - Manaíra",
    url: "https://www.google.com/maps/search/?api=1&query=R.%20Silvino%20Chaves%2C%20911%20-%20Mana%C3%ADra%2C%20Jo%C3%A3o%20Pessoa%20-%20PB%2C%2058038-420",
    icon_name: "map-pin",
    is_primary: false,
  },
  {
    title: "Consultório Recife - PE",
    subtitle: "Av. Mal. Mascarenhas de Morais, 4861",
    url: "https://www.google.com/maps/search/?api=1&query=Av.%20Mal.%20Mascarenhas%20de%20Morais%2C%204861%20-%20Imbiribeira%2C%20Recife%20-%20PE%2C%2051150-000",
    icon_name: "map-pin",
    is_primary: false,
  },
];

const FALLBACK_CONFIG: LinkTreeConfig = {
  title: "Dra. Dalila Lucena",
  subtitle: "Medicina de Performance & Longevidade",
  bio: "Ciência, precisão e performance aplicadas para transformar sua saúde e alcançar sua melhor versão.",
  avatar_url: "/perfil-links.png",
  instagram_url: "https://www.instagram.com/dalilalucena",
  whatsapp_url: "https://wa.me/5583988118436?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20em%20Jo%C3%A3o%20Pessoa.",
  video_url: "https://assets.mixkit.co/videos/preview/mixkit-medical-research-in-a-laboratory-40081-large.mp4",
  video_redirect_url: "https://www.instagram.com/p/DYnJV9XJcQS/",
  show_video: true
};

export default function LinksPage() {
  const [config, setConfig] = useState<LinkTreeConfig | null>(null);
  const [links, setLinks] = useState<LinkTreeLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Estados e refs de controle do vídeo do Instagram
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trava e pausa nos 10 segundos exatos
    if (video.currentTime >= 10) {
      video.pause();
      video.currentTime = 10;
      setVideoEnded(true);
      setVideoProgress(100);
    } else {
      setVideoProgress((video.currentTime / 10) * 100);
    }
  };

  const handlePlayAgain = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita o clique de redirecionamento no card
    if (!videoRef.current) return;
    const video = videoRef.current;
    video.currentTime = 0;
    setVideoProgress(0);
    setVideoEnded(false);
    setVideoLoading(false);
    video.play().catch(err => console.log("Erro ao reproduzir:", err));
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/links");
      if (!res.ok) throw new Error("Erro ao obter dados");
      const data = await res.json();

      setConfig(data.config);
      // Filtrar apenas links ativos da lista
      const activeLinks = data.links.filter((link: any) => link.is_active);
      setLinks(activeLinks.length > 0 ? activeLinks : FALLBACK_LINKS);
    } catch (err) {
      console.error("Falha ao carregar dados do Supabase. Usando fallbacks: ", err);
      setConfig(FALLBACK_CONFIG);
      setLinks(FALLBACK_LINKS);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${config?.title || "Dra. Dalila Lucena"} | Links Úteis`,
      text: `Acesse os canais de atendimento e agendamento de ${config?.title || "Dra. Dalila Lucena"}.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Erro ao compartilhar:", err);
      }
    } else {
      // Fallback: copiar para o clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setShowToast(true);
        setTimeout(() => {
          setCopied(false);
          setShowToast(false);
        }, 3000);
      } catch (err) {
        console.error("Falha ao copiar link:", err);
      }
    }
  };

  const getIconComponent = (name: string) => {
    switch (name) {
      case "calendar":
        return <Calendar className="w-5 h-5" />;
      case "message-square":
        return <MessageSquare className="w-5 h-5" />;
      case "map-pin":
        return <MapPin className="w-5 h-5" />;
      case "user":
        return <User className="w-5 h-5" />;
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "phone":
        return <Phone className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-y-auto bg-[#FAFAF7] flex flex-col items-center justify-start md:justify-center p-4 py-8 md:py-16">

      {/* Background Image Premium de Tela Inteira */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/img-links.png"
          alt="Plano de Fundo Geral"
          fill
          priority
          quality={95}
          className="object-cover"
          sizes="100vw"
        />
        {/* Filtro sutil para garantir contraste magnífico */}
        <div className="absolute inset-0 bg-[#FAFAF7]/15 backdrop-blur-[1px]" />
      </div>

      {/* Card Principal de Link Tree */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[480px] border border-[#E5E0DA] shadow-[0_24px_70px_rgba(46,43,51,0.06)] rounded-[32px] p-6 md:p-8 z-10 relative overflow-hidden"
      >
        {/* Imagem de Fundo Interna do Card (Otimizada e Premium) */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/bg-links.png"
            alt="Textura de Fundo"
            fill
            priority
            quality={100}
            className="object-cover"
            sizes="(max-width: 480px) 100vw, 480px"
          />
          {/* Overlay de alta legibilidade com efeito de vidro fosco */}
          <div className="absolute inset-0 bg-[#FAFAF7]/80 backdrop-blur-[2px]" />
        </div>

        {/* Conteúdo sobreposto */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {loading ? (
              // --- SKELETON LOADING PREMIUM ---
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Perfil Skeleton */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-[#E5E0DA]/50 animate-pulse mb-4" />
                  <div className="w-48 h-6 bg-[#E5E0DA]/50 rounded-md animate-pulse mb-2" />
                  <div className="w-32 h-4 bg-[#E5E0DA]/40 rounded-md animate-pulse mb-3" />
                  <div className="w-64 h-12 bg-[#E5E0DA]/30 rounded-md animate-pulse" />
                </div>
                {/* Links Skeleton */}
                <div className="space-y-4 pt-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="w-full h-16 rounded-2xl bg-[#E5E0DA]/40 animate-pulse flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E5E0DA]/30" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-4 bg-[#E5E0DA]/30 rounded" />
                          <div className="w-24 h-3 bg-[#E5E0DA]/20 rounded" />
                        </div>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-[#E5E0DA]/20" />
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              // --- CONTEÚDO PRINCIPAL DINÂMICO ---
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Botão de Compartilhar */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="absolute top-0 right-0 w-10 h-10 rounded-full bg-white/90 border border-[#E5E0DA] flex items-center justify-center text-[#2E2B33] hover:text-[#ABAB67] shadow-sm hover:shadow transition-all cursor-pointer"
                  title="Compartilhar página"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600 animate-scale-up" /> : <Share2 className="w-4 h-4" />}
                </motion.button>

                {/* Informações do Perfil */}
                <div className="flex flex-col items-center text-center mt-4 mb-8">
                  {/* Foto de Perfil com Anel Dourado Premium */}
                  <div className="relative mb-5 p-1 rounded-full bg-gradient-to-tr from-[#ABAB67] via-[#E3E388] to-[#ABAB67]">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-white bg-white relative">
                      <Image
                        src={config?.avatar_url || "/perfil-links.png"}
                        alt={config?.title || "Dra. Dalila Lucena"}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 768px) 96px, 112px"
                      />
                    </div>
                    {/* Elemento decorativo flutuante */}
                    <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#ABAB67] border-2 border-white flex items-center justify-center shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </span>
                  </div>

                  {/* Nome e Título */}
                  <h1 className="font-heading text-2xl md:text-3xl font-medium tracking-wide text-[#2E2B33] mb-2 leading-tight">
                    {config?.title}
                  </h1>
                  <p className="font-body text-[0.7rem] tracking-[0.2em] text-[#82824E] uppercase font-semibold mb-3">
                    {config?.subtitle}
                  </p>
                  {config?.bio && (
                    <p className="font-body text-xs md:text-sm text-[#5E5E39]/85 max-w-[320px] leading-relaxed mb-6 font-medium">
                      {config.bio}
                    </p>
                  )}

                  {/* Redes Sociais */}
                  <div className="flex items-center justify-center gap-4">
                    {config?.instagram_url && (
                      <motion.a
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        href={config.instagram_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-11 h-11 rounded-full bg-white border border-[#E5E0DA] flex items-center justify-center text-[#2E2B33] hover:text-[#6926D5] shadow-sm hover:shadow transition-all"
                        title="Instagram"
                      >
                        <Instagram className="w-5 h-5" />
                      </motion.a>
                    )}
                    {config?.whatsapp_url && (
                      <motion.a
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        href={config.whatsapp_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-11 h-11 rounded-full bg-white border border-[#E5E0DA] flex items-center justify-center text-[#2E2B33] hover:text-emerald-600 shadow-sm hover:shadow transition-all"
                        title="WhatsApp"
                      >
                        <Phone className="w-5 h-5" />
                      </motion.a>
                    )}
                  </div>
                </div>

                {/* Player de Vídeo Destaque (Instagram Preview 10s) */}
                {config?.show_video && config?.video_url && (
                  <div className="mb-8 w-full">
                    <p className="text-[0.65rem] font-body font-bold text-[#82824E] tracking-widest uppercase text-center mb-3 flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#82824E] animate-pulse" />
                      Destaque do Instagram
                    </p>
                    <Link
                      href={config.video_redirect_url || "https://www.instagram.com/p/DYnJV9XJcQS/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-[#E5E0DA] bg-gradient-to-br from-[#FAF9F5] to-[#E5E0DA] shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                    >
                      {/* Estado de Carregamento Premium (Spinner) */}
                      {videoLoading && !videoError && (
                        <div className="absolute inset-0 bg-[#FAFAF7]/50 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center pointer-events-none">
                          <div className="w-8 h-8 rounded-full border-2 border-[#82824E]/20 border-t-[#82824E] animate-spin mb-2" />
                          <span className="text-[9px] font-body font-bold text-[#82824E] tracking-widest uppercase">Carregando...</span>
                        </div>
                      )}

                      {/* Estado de Erro / Fallback de Rede Magnífico (Capa Poster Cheia) */}
                      {videoError && (
                        <div className="absolute inset-0 z-20 w-full h-full bg-gradient-to-br from-[#FAF9F5] to-[#E3E0D8]">
                          {/* Imagem de Capa Cheia */}
                          <Image
                            src="/poster-link.png"
                            alt="Capa do destaque no Instagram"
                            fill
                            priority
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {/* Overlay escuro sutil para garantir legibilidade do Header */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/35 pointer-events-none" />

                          {/* Ícone de Play central estilizado em vidro */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#82824E] shadow-lg border border-white/20 transform scale-100 group-hover:scale-110 transition-all duration-300 animate-pulse">
                              <Play className="w-6 h-6 ml-1 fill-[#82824E] text-[#82824E]" />
                            </span>
                          </div>

                          {/* Tag flutuante inferior estilo legenda */}
                          <div className="absolute bottom-3 left-3 right-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-2.5 flex items-center justify-between text-white text-[10px] font-semibold tracking-wide shadow-sm">
                            <span>Assistir no Instagram</span>
                            <Instagram className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Video HTML5 */}
                      {!videoError && (
                        <video
                          ref={videoRef}
                          src={config.video_url}
                          poster="/poster-link.png"
                          autoPlay
                          muted={isMuted}
                          playsInline
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedData={() => setVideoLoading(false)}
                          onPlay={() => setVideoLoading(false)}
                          onWaiting={() => setVideoLoading(true)}
                          onPlaying={() => setVideoLoading(false)}
                          onError={() => { setVideoError(true); setVideoLoading(false); }}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                        />
                      )}

                      {/* Header do Instagram Estilo Reels */}
                      {!videoError && (
                        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 via-black/30 to-transparent p-3 flex items-center justify-between z-20 pointer-events-none select-none">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full border border-white/35 overflow-hidden bg-white/10 relative">
                              <Image
                                src={config?.avatar_url || "/perfil-links.png"}
                                alt="Avatar"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-[11px] font-semibold text-white tracking-wide drop-shadow-sm flex items-center gap-1">
                                dalilalucena
                                <span className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center inline-flex">
                                  <svg viewBox="0 0 24 24" fill="none" className="w-2 h-2 text-white stroke-[3.5]" stroke="currentColor">
                                    <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              </span>
                              <span className="text-[7.5px] text-white/80 tracking-widest uppercase font-bold drop-shadow-sm">Destaque</span>
                            </div>
                          </div>

                          <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/90 border border-white/15 shadow-sm">
                            <Instagram className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}

                      {/* Barra de Progresso Estilo Stories (Fina e flutuante abaixo do header) */}
                      {!videoError && (
                        <div className="absolute top-13 left-3 right-3 h-[2.5px] bg-white/25 backdrop-blur-[1px] rounded-full overflow-hidden z-20 pointer-events-none select-none">
                          <div
                            className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] transition-all duration-100 ease-linear"
                            style={{ width: `${videoProgress}%` }}
                          />
                        </div>
                      )}

                      {/* Botão de Som Mute/Unmute flutuante no canto inferior direito */}
                      {!videoEnded && !videoError && !videoLoading && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={toggleMute}
                          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:bg-black/55 transition-all z-20 shadow-md"
                          title={isMuted ? "Ativar som" : "Desativar som"}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </motion.button>
                      )}

                      {/* Overlay Premium ao Fim dos 10 Segundos */}
                      <AnimatePresence>
                        {videoEnded && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#1A181D]/65 backdrop-blur-[6px] z-30 flex flex-col items-center justify-center p-6 text-center"
                          >
                            <motion.div
                              animate={{ scale: [1, 1.05, 1], rotate: [0, 1.5, -1.5, 0] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FFB703] via-[#D62246] to-[#4B1E96] flex items-center justify-center text-white mb-4 shadow-[0_8px_25px_rgba(214,34,70,0.3)] border border-white/10"
                            >
                              <Instagram className="w-7 h-7" />
                            </motion.div>

                            <h4 className="text-white font-heading text-base font-bold tracking-wide mb-1.5">
                              Quer ver a publicação?
                            </h4>
                            <p className="text-white/80 font-body text-[0.72rem] max-w-[220px] leading-relaxed mb-5 font-medium">
                              Assista ao vídeo completo e leia a legenda detalhada diretamente no nosso perfil.
                            </p>

                            <div className="flex items-center gap-2.5">
                              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#82824E] to-[#5E5E39] text-white text-[0.72rem] px-4 py-2.5 rounded-xl font-bold shadow-[0_4px_15px_rgba(130,130,78,0.3)] hover:shadow-[0_6px_20px_rgba(130,130,78,0.4)] transition-all scale-100 hover:scale-105">
                                Ver no Instagram
                              </span>
                              <button
                                type="button"
                                onClick={handlePlayAgain}
                                className="w-9 h-9 rounded-xl bg-white/15 border border-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-all z-40 shadow-sm"
                                title="Repetir preview"
                              >
                                <RotateCcw className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Overlay sutil de Hover no player */}
                      {!videoEnded && !videoError && !videoLoading && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 z-10 flex items-center justify-center">
                          <span className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[#82824E] shadow-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <Play className="w-4 h-4 ml-0.5 fill-[#82824E] text-[#82824E]" />
                          </span>
                        </div>
                      )}
                    </Link>
                  </div>
                )}

                {/* Lista de Botões de Links */}
                <div className="flex flex-col gap-4">
                  {links.map((link, index) => (
                    <motion.div
                      key={link.title}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.1 }}
                    >
                      <motion.div
                        whileHover={{ y: -3, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full group"
                      >
                        <Link
                          href={link.url}
                          target={link.url.startsWith("http") ? "_blank" : "_self"}
                          rel={link.url.startsWith("http") ? "noopener noreferrer" : ""}
                          className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                            link.is_primary
                              ? "bg-gradient-to-r from-[#82824E] to-[#5E5E39] border-transparent text-white shadow-[0_8px_20px_rgba(130,130,78,0.25)] hover:shadow-[0_12px_24px_rgba(130,130,78,0.35)]"
                              : "bg-white/95 border-[#E5E0DA] text-[#2E2B33] hover:border-[#82824E]/40 hover:bg-white shadow-sm hover:shadow-md"
                          }`}
                        >
                          {/* Efeito sutil de brilho nos botões primários */}
                          {link.is_primary && (
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                          )}

                          {/* Ícone à Esquerda */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-300 ${
                            link.is_primary
                              ? "bg-white/10 text-white"
                              : "bg-[#FAFAF7] text-[#82824E] group-hover:bg-[#82824E]/10"
                          }`}>
                            {getIconComponent(link.icon_name)}
                          </div>

                          {/* Textos Centralizados */}
                          <div className="flex-1 px-4 text-left">
                            <p className={`font-body text-sm font-semibold tracking-wide ${
                              link.is_primary ? "text-white" : "text-[#2E2B33]"
                            }`}>
                              {link.title}
                            </p>
                            {link.subtitle && (
                              <p className={`font-body text-[0.68rem] mt-0.5 ${
                                link.is_primary ? "text-white/80" : "text-[#5E5E39]/70"
                              }`}>
                                {link.subtitle}
                              </p>
                            )}
                          </div>

                          {/* Ícone de Mais Detalhes (três pontinhos estilizados) */}
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
                            link.is_primary
                              ? "text-white/40 group-hover:text-white/80 group-hover:scale-110"
                              : "text-[#9B9B9B]/60 group-hover:text-[#82824E] group-hover:scale-110"
                          }`}>
                            <MoreVertical className="w-4 h-4" />
                          </div>
                        </Link>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                {/* Rodapé do Card */}
                <div className="mt-8 text-center">
                  <Link href="/" className="font-heading text-xs text-[#9B9B9B] hover:text-[#82824E] hover:underline transition-colors uppercase tracking-[0.15em] font-semibold">
                    www.dalilalucena.com.br
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Notificação Toast Elegante para Cópia de Link */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#2E2B33] text-white px-5 py-3 rounded-full border border-white/10 shadow-lg flex items-center gap-3 z-50 text-xs md:text-sm tracking-wide font-medium backdrop-blur-md bg-opacity-95"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span>Link copiado com sucesso para compartilhar!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
