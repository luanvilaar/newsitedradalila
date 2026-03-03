export const SITE_CONFIG = {
  name: "Dra. Dalila Lucena",
  title: "Dra. Dalila Lucena | Medicina de Performance e Longevidade",
  description:
    "Especialista em Obesidade, Performance, Reposição Hormonal e Implantes Hormonais. Atendimento em João Pessoa e Recife.",
  crm: "CRM 15295",
  locations: [
    { city: "João Pessoa", state: "PB" },
    { city: "Recife", state: "PE" },
  ],
} as const;

export const SPECIALTIES = [
  {
    id: "obesity",
    title: "Obesidade",
    description:
      "Tratamento individualizado para emagrecimento com base em ciência, exames e acompanhamento estratégico.",
    icon: "Scale",
  },
  {
    id: "performance",
    title: "Performance",
    description:
      "Protocolos de alta performance para atletas e praticantes de atividade física, com foco em resultados e segurança.",
    icon: "Zap",
  },
  {
    id: "hormonal-replacement",
    title: "Reposição Hormonal",
    description:
      "Equilíbrio hormonal personalizado para saúde, qualidade de vida e longevidade.",
    icon: "HeartPulse",
  },
  {
    id: "hormonal-implants",
    title: "Implantes Hormonais",
    description:
      "Implantes subcutâneos com liberação contínua e controlada para resultados consistentes.",
    icon: "Syringe",
  },
] as const;

export const NAV_PATIENT = [
  { href: "/paciente", label: "Visão Geral", icon: "LayoutDashboard" },
  { href: "/paciente/servicos", label: "Serviços", icon: "ClipboardList" },
  { href: "/paciente/medicamentos", label: "Medicamentos", icon: "Pill" },
  { href: "/paciente/exames", label: "Exames", icon: "FileText" },
  {
    href: "/paciente/bioimpedancia",
    label: "Bioimpedância",
    icon: "Activity",
  },
  { href: "/paciente/dieta", label: "Dieta", icon: "Utensils" },
  { href: "/paciente/treino", label: "Treino", icon: "Dumbbell" },
] as const;

export const NAV_ADMIN = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/pacientes", label: "Pacientes", icon: "Users" },
  { href: "/admin/documentos", label: "Documentos", icon: "FolderOpen" },
] as const;
