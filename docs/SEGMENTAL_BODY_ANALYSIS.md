# Análise Corporal Segmentar - Documentação

## Visão Geral

O componente `SegmentalBodyAnalysis` implementa uma visualização premium e animada da composição corporal segmentar do paciente, incluindo:

- **Massa Magra Segmentar**: Análise detalhada do tecido muscular por segmento
- **Gordura Segmentar**: Análise detalhada da gordura corporal por segmento
- **Avatar Humano Animado**: Silhueta humana com visualização interativa
- **Indicadores de Status**: Normal, Acima ou Abaixo do esperado

## Características Premium

### 🎨 Design e Animações

- **Framer Motion**: Animações fluidas e transições suaves
- **Gradientes**: Cores degrades para o visual premium
- **Interatividade**: Toggle entre Massa Magra e Gordura
- **Responsivo**: Adaptável a diferentes tamanhos de tela
- **Pulse Effects**: Efeitos de pulsação em segmentos problemáticos

### 📊 Dados Segmentares

O componente analisa 5 segmentos corporais:

1. **Braço Esquerdo**
2. **Braço Direito**
3. **Tronco**
4. **Perna Esquerda**
5. **Perna Direita**

Para cada segmento mostramos:
- Valor em kg
- Percentual em relação ao esperado
- Status (Normal/Acima/Abaixo)
- Barra de progresso animada

## Uso

### Importação

```tsx
import { SegmentalBodyAnalysis } from "@/components/bioimpedance/SegmentalBodyAnalysis";
```

### Exemplo Básico

```tsx
<SegmentalBodyAnalysis />
```

### Com Dados Personalizados

```tsx
const customLeanMass = {
  leftArm: { value: 2.5, percentage: 110.0, status: "Normal" },
  rightArm: { value: 2.5, percentage: 110.0, status: "Normal" },
  trunk: { value: 20.0, percentage: 95.0, status: "Normal" },
  leftLeg: { value: 8.0, percentage: 100.0, status: "Normal" },
  rightLeg: { value: 8.0, percentage: 100.0, status: "Normal" },
};

<SegmentalBodyAnalysis leanMass={customLeanMass} />
```

## Integração

### Páginas Integradas

1. **`/paciente/bioimpedancia`**: Visualização para o paciente
2. **`/admin/pacientes/[id]/bioimpedancia`**: Admin view com preview
3. **`PatientOverviewCharts`**: Dashboard do admin

### Fluxo de Dados

```
Bioimpedance Record (Database)
    ↓
segmental_analysis (JSON field)
    ↓
SegmentalBodyAnalysis Component
    ↓
Visual Interactive Display
```

## Estrutura de Dados

```typescript
interface SegmentData {
  value: number;        // kg
  percentage: number;   // %
  status: "Normal" | "Acima" | "Abaixo";
}

interface SegmentalData {
  leftArm: SegmentData;
  rightArm: SegmentData;
  trunk: SegmentData;
  leftLeg: SegmentData;
  rightLeg: SegmentData;
}
```

## Recursos Visuais

### Avatar Humano

- Silhueta humana espelhada (esquerda/direita)
- Segmentos coloridos conforme tipo (azul = magro, laranja = gordura)
- Opacidade baseada no status
- Efeitos de pulse para alertas

### Indicadores de Status

- 🟢 **Normal**: Verde (faixa esperada)
- 🔴 **Acima**: Vermelho (acima do esperado)
- 🟡 **Abaixo**: Amarelo (abaixo do esperado)

### Barras de Progresso

- Animação da esquerda para direita
- Cores gradiente baseadas no tipo
- Cores de alerta para status problemático

## Animações

### Timeline de Entrada

```
0.1s → Cartões laterais (esquerda/direita)
0.2s → Dados de braços
0.3s → Dados de pernas + Tronco
0.4s → Progress bars
0.5s → Status badges
```

### Efeitos Contínuos

- **Pulse**: Em segmentos "Acima" (2s loop)
- **Hover**: Suave elevação dos cards
- **Toggle**: Transição suave entre Massa/Gordura

## Personalização

### Cores

```tsx
// Massa Magra (default)
color = "blue"  // #3B82F6

// Gordura
color = "orange"  // #F97316

// Definir em SegmentalBodyAnalysis.tsx
```

### Dimensões

```tsx
// Avatar
height: 64 (256px)
width: 32 (128px)

// Cards
padding: 6 (1.5rem)
gap: 6 (1.5rem)
```

## Notas Técnicas

1. **Performance**: Usa Framer Motion com `viewport={{ once: true }}` para animações únicas
2. **Acessibilidade**: Labels semânticos e contraste adequado
3. **Responsividade**: Grid adaptável (1 col mobile, 2 cols desktop)
4. **Dados Mock**: Valores padrão baseados na captura de tela fornecida

## Futuras Melhorias

- [ ] Integração com dados reais do banco (segmental_analysis field)
- [ ] Gráficos de evolução temporal por segmento
- [ ] Comparação com padrões de referência por idade/sexo
- [ ] Export PDF da análise segmentar
- [ ] Tooltips educacionais sobre cada métrica
- [ ] Modo de comparação (antes/depois)

## Referências

- Design baseado em análises de bioimpedância InBody
- Animações premium com Framer Motion
- Paleta de cores alinhada com o design system do DT

---

**Criado em**: 3 de março de 2026  
**Versão**: 1.0.0  
**Autor**: Claude Code (GitHub Copilot)
