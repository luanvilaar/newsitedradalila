// Example: How to integrate premium images into MethodGrid component
// Add this import at the top
import Image from "next/image";
import { UserCheck, BarChart3, Target, FileCheck } from "lucide-react";

// Update the differentials array to include image paths
const differentials = [
  {
    icon: UserCheck,
    title: "Atendimento Personalizado",
    description: "Cada paciente é único. Protocolos desenhados individualmente...",
    span: "md:col-span-2 md:row-span-2",
    featured: true,
    image: "/atendimento-personalizado.png",
    imageAlt: "Atendimento personalizado com médico e paciente"
  },
  {
    icon: BarChart3,
    title: "Avaliação por Bioimpedância",
    description: "Análise completa da composição corporal...",
    span: "",
    featured: false,
    image: "/bioimpedancia-assessment.png",
    imageAlt: "Equipamento de bioimpedância em uso"
  },
  {
    icon: Target,
    title: "Acompanhamento Estratégico",
    description: "Monitoramento contínuo da evolução...",
    span: "",
    featured: false,
    image: "/acompanhamento-estrategico.png",
    imageAlt: "Dashboard de monitoramento de saúde"
  },
  {
    icon: FileCheck,
    title: "Protocolos Individualizados",
    description: "Medicações, dieta e treino integrados...",
    span: "md:col-span-2",
    featured: false,
    image: "/protocolos-individualizados.png",
    imageAlt: "Protocolos médicos personalizados"
  },
];

// In the card rendering, add image support:
{motion.div}
  {/* Existing card content */}
  <motion.div className="w-16 h-16 rounded-[var(--radius-lg)] bg-gradient-to-br from-accent-gold/15 to-accent-gold/5 flex items-center justify-center mb-6 border border-accent-gold/20 group-hover:from-accent-gold/25 group-hover:to-accent-gold/10 transition-all duration-300" whileHover={{ scale: 1.1, rotate: 5 }}>
    {Icon && <Icon size={32} className="text-accent-gold group-hover:scale-125 transition-transform duration-300" />}
  </motion.div>

  {/* Add premium image */}
  {item.image && (
    <motion.div className="relative w-full h-32 mb-4 rounded-[var(--radius-lg)] overflow-hidden">
      <Image
        src={item.image}
        alt={item.imageAlt}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
      />
      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  )}

  {/* Existing title and description */}
  <h3 className="font-heading text-xl md:text-2xl tracking-wide mb-3">{item.title.toUpperCase()}</h3>
  <p className="text-sm leading-relaxed mb-4">{item.description}</p>
{/motion.div}